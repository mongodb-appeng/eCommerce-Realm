/**
 * @typedef {Object} LineItem
 * @property {string} productID - Uniquely identifies the product
 * @property {number} quantity - Number of this product included in the order
 */
/**
 * Reduce the stock level of the product to reflect this line item from an order.
 * @param {LineItem} lineItem: Line item from an order
 * @returns {Promise}
 */
exports = function (lineItem) {
    // This is implemented as a seperate, private Stitch Function so that it can run as
    // System to update the product documents.
    const productsCollection = context.services.get("mongodb-atlas").db("ecommerce").collection("products");
    return productsCollection.findOne({productID: lineItem.productID})
    .then ((productDoc) => {
        const newStockLevel = Math.max (0, productDoc.stockLevel - lineItem.quantity);
        return productsCollection.updateOne(
            {productID: lineItem.productID},
            {$set: {stockLevel: newStockLevel}}
        );
    },
    (error) => {
        const errorSring = `Failed to update existing product document: ${error.message}`;
        console.error(errorSring);
    });
};