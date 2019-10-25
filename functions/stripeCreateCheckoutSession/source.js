/**
 * To process a payment through Stripe Checkout, this function creates a context for the payment;
 * the resulting `id` can then be returned to the frontend app when redirecting to stripe.
 * @param {number} amount - The amount to charge to the customer's card, in $USD
 * @returns {string} - a unique ID associated with this Stripe session that the frontend can use
 * to redirect to the Stripe Checkout page to take the payment
 */

exports = function(amount) {
  const amountInCents = Math.round(amount * 100);
  const http = context.services.get("Stripe");
  const secretKey = context.values.get("stripeSecretKey");
  const productImage = context.values.get("MongoDBProductImage");
  const successURL = context.values.get("stripePurchaseSuccessURL");
  const cancelURL = context.values.get("stripePurchaseCancelURL");
  const customers = context.services.get("mongodb-atlas").db("ecommerce").collection("customers");

  return customers.findOne({owner_id: context.user.id}, {"contact.email": 1})
  .then ((customer) => {
    const formData = {
      "payment_method_types[]": ["card"],
      "line_items[][name]": "MongoDB eCommerce order",
      "line_items[][description]": "Your order from MongoDB",
      "line_items[][images][]": productImage,
      "line_items[][amount]": amountInCents,
      "line_items[][currency]": "usd",
      "line_items[][quantity]": 1,
      "customer_email": customer.contact.email,
      success_url: successURL,
      cancel_url: cancelURL
    };

    // Need to url-encode the form object (as that's the format required by the
    // Stripe API)
    let formBody = [];
    for (let property in formData) {
      const encodedKey = encodeURIComponent(property); 
      const encodedValue = encodeURIComponent(formData[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    return http.post({
      url: "https://api.stripe.com/v1/checkout/sessions",
      body: formBody,
      headers: {
        "Authorization": [ `Bearer ${secretKey}` ],
        "Content-Type": [ "application/x-www-form-urlencoded" ]
      }
    });
  })
  .then(response => {
    // The response body is encoded as raw BSON.Binary. Parse it to JSON.
    const ejson_body = EJSON.parse(response.body.text());
    return ejson_body.id;
  },
  (error) => {
    console.log(`Failed to create session: ${error}`);
  });
};