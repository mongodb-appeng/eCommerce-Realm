/**
 * Sends a text message (using the Twilio service) to the user to tell them
 * that their watched product is now back in stock
 * @param {string} destinationPhone - Phone number to send the text to
 * @param {string} productName - Product name to include in the text message
 * @param {string} productID - Uniquely identifies the product
 * @param {boolean} textAllowed - Whether the customer has agreed to receive text notifiactions
 * @returns {Promise}
 */
exports = function(destinationPhone, productName, productID, textAllowed){
    if (!textAllowed || !destinationPhone.mobile) {return}
    const twilio = context.services.get("TwilioText");
    const twilioNumber = context.values.get('twilioNumber');
    const productURL = `${context.values.get('productURLPrefix')}${productID}`;
    const body = `"${productName}" is now back in stock: ${productURL}`;
    return twilio.send({
      to: destinationPhone.mobile,
      from: twilioNumber,
      body: body
    });
  };