// This function is the webhook's request handler.
exports = function(payload, response) {
    // This is a binary object that can be accessed as a string using .text()
    const body = EJSON.parse(payload.body.text());
    console.log(`Customer email: ${body.data.object.customer_email}`);
    const customers = context.services.get("mongodb-atlas").db("ecommerce").collection("customers");
    return context.functions.execute('placeOrder', 'Credit or debit card', body.data.object.customer_email)
    .then (() => {
      customers.updateOne({"contact.email": body.data.object.customer_email}, {$set: {shoppingBasket: []}});
      return "Order processed successfully";
    },
    () => {
      return "Problem with the order";
    });
};