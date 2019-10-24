// git was here

/**
 * @typedef {Object} ReviewStats
 * @property {number} averageReviewScore
 * @property {number} numberOfReviews
 */

/**
 * Adds the new review to the `products` document. If there are more than 10 reviews in the `products`
 * document then archive the oldest review to its own document in the `reviewOverflow` document.
 * @param {string} productID – Uniquely identifies which document the review is for
 * @param {string} comment – The text of the comment
 * @param {number} stars - How the user rates the product (out of 5)
 * @returns {ReviewStats} - The average review score and total number of reviews submitted (including this one)
 */
exports = function(productID, comment, stars) {
    const productsCollection = context.services.get("mongodb-atlas").db("ecommerce").collection("products");
    const reviewsCollection = context.services.get("mongodb-atlas").db("ecommerce").collection("reviewOverflow");
    let reviewToArchive = null;
    let averageReviewScore = 0;
    let numberOfReviews = 0;
    return productsCollection.findOne({productID: productID})
    .then ((product) => {
      product.reviews.numberOfReviews++;
      numberOfReviews = product.reviews.numberOfReviews;
      product.reviews.totalReviewScore += stars;
      product.reviews.averageReviewScore =  product.reviews.totalReviewScore / product.reviews.numberOfReviews;
      averageReviewScore = product.reviews.averageReviewScore;
      const newReview = {
        'review': comment,
        'score': stars
      };
      let newReviewArray = [newReview];
      product.reviews.recentReviews = newReviewArray.concat(product.reviews.recentReviews);
      if (product.reviews.recentReviews.length > 10) {
        reviewToArchive = product.reviews.recentReviews.pop();
        reviewToArchive.productID = productID;
        product.reviews.overflow = true;
      }
      return productsCollection.updateOne(
        {productID: productID},
        {$set: {reviews: product.reviews}}
        );
    })
    .then (() => {
        if (reviewToArchive) {
            return reviewsCollection.insertOne(reviewToArchive);
        } else {
            return {
                averageReviewScore: averageReviewScore,
                numberOfReviews: numberOfReviews
            };
        }
    })
    .then (() => {
        return {
            averageReviewScore: averageReviewScore,
            numberOfReviews: numberOfReviews
        };
    },
    (error) => {
        console.error(`Failed to store the new review for ${productID}: ${error.message}`);
    });
 };