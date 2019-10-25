/**
 * Called once a product is back in stock. For each customer that's waiting on
 * the product send them a text and/or email notification that it's back in
 * stock and remove it from the customer's waiting list
 * @param {object} event - Change event: https://docs.mongodb.com/stitch/triggers/database-triggers/#database-change-events
 * @returns {Promise}
 */
exports = function(event) {
    const db = context.services.get("mongodb-atlas").db("ecommerce");
    const customers = db.collection("customers");
    const product = event.fullDocument;
    const notifyCustomer = (customer) => {
        return context.functions.execute(
            "emailStockNotification",
            customer.contact.email,
            product.productName,
            product.productID,
            customer.marketingPreferences.email
        )
        .then(() => {
            return context.functions.execute(
                "textStockNotification",
                customer.contact.phone,
                product.productName,
                product.productID,
                customer.marketingPreferences.sms
            );
        })
        .then(() => {
            let waitingOnProducts = [...customer.waitingOnProducts];
            let index = waitingOnProducts.indexOf(product.productID);
            waitingOnProducts.splice(index, 1);
            return customers.updateOne(
                {'contact.email': customer.contact.email},
                {$set: {waitingOnProducts: waitingOnProducts}}
            );
        })
        .catch((error) => {
            console.log(error);
        });
    };
    return customers.find({waitingOnProducts: product.productID}).toArray().then((customers) => {
        return Promise.all(customers.map((customer) => {
            return notifyCustomer(customer);
        }));
    });
};