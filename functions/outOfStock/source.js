/** 
 * Marks product as being out of stock (using an internal field not known to the
 * legacy stock management system)
 * @param {object} changeEvent - https://docs.mongodb.com/stitch/triggers/database-triggers/#database-change-events
 */
exports = function(changeEvent) {
    const products = context.services.get('mongodb-atlas').db("ecommerce").collection("products");
    products.updateOne(
      {productID: changeEvent.fullDocument.productID},
      {$set: {"internal.outOfStock": true}}
    )
    .catch ((error) => {
      console.log(error);
    });
  };