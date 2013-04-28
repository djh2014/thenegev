
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


Parse.Cloud.beforeSave("Booking", function(request, response) {
  if (request.object.get("cardToken") != null) {
  	var Stripe = require('stripe');
	Stripe.initialize('sk_live_yb2cRe1Fhw2zlxMausdaEZVd');
  	console.log("trying to charge");
  	Stripe.Charges.create({
		  amount: Number(request.object.get("price")) * 100,
		  currency: "usd",
		  card: request.object.get("cardToken") 
	  },
	  {
		  success: function(httpResponse) {
		    console.log("Succes!!");
		    response.success();
		  },
		  error: function(httpResponse) {
		  	console.log("Bad card");
		    response.error("Can't accept card");
	  	  }
	});
  } else {
  	// TODO(gutman): replace it with admin permissions:
    console.log("Saving without a card. probably AirBNB");
    request.object.set("airbnb", "yes");
    response.success();
  }
});