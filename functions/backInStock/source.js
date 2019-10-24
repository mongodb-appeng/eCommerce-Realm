/**
 * Updates the product to indicate that it's no longer out of stock. Delegates sending
 * notifications to registered users to `productInStock`
 * @param {object} changeEvent - https://docs.mongodb.com/stitch/triggers/database-triggers/#database-change-events
 */
exports = function(changeEvent) {
  const products = context.services.get('mongodb-atlas').db("ecommerce").collection("products");
  products.updateOne(
    {productID: changeEvent.fullDocument.productID},
    {$set: {"internal.outOfStock": false}}
  )
  .then (() => {
    context.functions.execute("productInStock", changeEvent);
  })
  .catch ((error) => {
    console.log(error);
  });
};