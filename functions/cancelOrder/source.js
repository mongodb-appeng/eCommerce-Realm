/**
 * @typedef {Object} Result
 * @property {boolean} result – Indicates success/failure
 * @property {string} error - If failure, contains the error message
 */
/**
 * Removes the order from the customer's document, and adjusts up the stock levels
 * for all products that were part of the order.
 * @param {string} orderID - Uniquely identifies the order
 * @returns {Result}
 */
exports = function(orderID) {
    const customerCollection = context.services.get("mongodb-atlas").db("ecommerce").collection("customers");
    let query = {owner_id: context.user.id};
    let orderToDelete = null;

    return customerCollection.findOne(query)
    .then ((customer) => {
        let existingIndex = -1;
        if (customer.orders.some(function(item, index) {
          existingIndex = index;
          return item.orderID === orderID;
        })) {
          orderToDelete = customer.orders[existingIndex];
          // Create a by-value copy and remove the order from the derived position
          let newOrders = customer.orders.slice();
          newOrders.splice(existingIndex, 1);
          customer.orders = newOrders;
          return customerCollection.updateOne(
              {"contact.email": customer.contact.email},
              {$set: {orders: newOrders}}
          );
        } else {
          console.log(`Unable to find orderID: ${orderID}`);
        }
    })
    .then (() => {
        // Update stock levels for every product in the order
        return Promise.all(orderToDelete.items.map((item) => {
            item.quantity = 0 - item.quantity;
            return context.functions.execute('updateStockLevel', item);
        }));
    })
    .then(() => {
      return {result: true};
    },
    (error) => {
        const errorSring = `Failed to delete the order: ${error.message}`;
        console.error(errorSring);
        return {result: false, error: errorSring};
    });
 };