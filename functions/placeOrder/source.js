/**
 * @typedef {Object} Result
 * @property {boolean} result – Indicates success/failure
 * @property {string} error - If failure, contains the error message
 */
/**
 * Creates an order using the contents of the customer's shopping basket (as stored in the
 * `customer` document.) Stores the new order in the `customer` document and (if there are
 * now more than 10 orders) archives the oldest to its own document in the `orderOverflow`
 * collection.
 * @param {string} paymentMethod - Stored as part of the order
 * @param {email} - Uniquely identifies the customer
 * @returns {Result}
 */
exports = function(paymentMethod, email) {
    const customerCollection = context.services.get("mongodb-atlas").db("ecommerce").collection("customers");
    const orderCollection = context.services.get("mongodb-atlas").db("ecommerce").collection("orderOverflow");
    let orderToArchive = null;
    let thisOrderItems = null;
    let query = {};
    if (email) {
      query = {"contact.email": email};
    } else {
      query = {owner_id: context.user.id};
    }
    return customerCollection.findOne(query)
    .then ((customer) => {
        const totalPrice = customer.shoppingBasket.reduce((total, item) =>
        {
          return total + (item.quantity * item.price);
        }, 0);      
        let newOrder = {
            orderID: `${customer.contact.email}-${Date.now()}`,
            status: 'pending',
            orderDate: new Date(),
            deliveryDate: null,
            deliveryAddress: customer.contact.deliveryAddress,
            totalPrice: totalPrice,
            paymentMethod: paymentMethod,
            items: customer.shoppingBasket
        };
        thisOrderItems = customer.shoppingBasket;
        customer.orders = [newOrder].concat(customer.orders);
        if (customer.orders.length > 10) {
            console.log('Need to archive older order');
            orderToArchive = customer.orders.pop();
            orderToArchive.customerEmail = customer.contact.email;
            orderToArchive.owner_id = context.user.id;
        }
        return customerCollection.updateOne(
            query,
            {$set: {
              orders: customer.orders,
              orderOverflow: true
            }}
        );
    })
    .then (() => {
        if (orderToArchive) {
            return orderCollection.insertOne(orderToArchive);
        } else {
            return {result: true};
        }
    })
    .then (() => {
        // Update stock levels for every product in the order
        return Promise.all(thisOrderItems.map((item) => {
          return context.functions.execute('updateStockLevel', item);
        }));
    })
    .then(() => {
      return {result: true};
    },
    (error) => {
        const errorSring = `Failed to store the new order: ${error.message}`;
        console.error(errorSring);
        return {result: false, error: errorSring};
    });
 };