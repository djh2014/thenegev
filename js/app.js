//TODO(gutman): temp:
price = ''

// Define Globals:
  Parse.initialize("Pe2aVvOhSuUgef67pirBiesOAUdEc0evUOjOVVG2", "ef8ZawXgmHhW8n1zBlHea57RJeBqoH8EcSJePl1X");
  Booking = Parse.Object.extend("Booking");
  // Rooms and their guests capacity:
  var ROOMS = [["Shared", 10], ["Private", 1], ["Curatin", 2]];
  // Rooms and Prices, per day, per week, per month.
  var ROOMS_PRICES = {"Shared": [50, 300, 1000],
                      "Private": [100, 400, 1400],
                      "Curatin": [75, 350, 1200]}

  function getFreeSapces(startDate, endDate, callback) {
    // find booking for relevant dates:
    var query = new Parse.Query(Booking);
    query.greaterThanOrEqualTo("end", startDate);
    query.lessThanOrEqualTo("start", endDate);
    query.find({success:function(bookings) {
      // Initlize freeSpace
      var freeSpace = [];
      
      for (var date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        freeSpace[date.toString()] = [];
        for (var i = 0; i < ROOMS.length; i++) {
          freeSpace[date][ROOMS[i][0]] = ROOMS[i][1];
        };
      }
      // Go over bookings, and update freeSpace.
      for (var i = 0; i < bookings.length; i++) {
        var booking = convertBookingToJSON(bookings[i]);
        for (var date = booking.start; date <= booking.end; date.setDate(date.getDate() + 1)) {
          if (freeSpace[date.toString()] != null) {
            freeSpace[date.toString()][booking.room] = freeSpace[date.toString()][booking.room] - Number(booking.number_of_guests);
          }
        }
      };
      callback(freeSpace);
    }});
  }

  createBookingFromInput = function() {
    var booking = new Booking();
    var endDate = endPicker.getLocalDate();
    endDate.setHours(0, 0, 0, 0);
    var startDate = startPicker.getLocalDate();
    startDate.setHours(0, 0, 0, 0);
    booking.set("start", startDate);
    booking.set("end", endDate);
    booking.set("price", price || 'Nan');
    booking.set("title", $('#guest-name').val() + ", " + $("#number-of-guests").val() + ", " + $("#room").val());
    booking.set("guest_name", $('#guest-name').val());
    booking.set("guest_name", $('#guest-name').val());
    booking.set("number_of_guests", $("#number-of-guests").val());
    booking.set("room", $("#room").val());
    return booking;
                    
  }

  // TODO(gutman): add a unit test.
  calculatePrice = function(booking) {
    var numberOfDays = moment.duration(booking.end - booking.start).asDays()+1;
    var priceType;  
    if (numberOfDays < 7) {
      priceType = [0, 1]; // price-type, unit-size
    } else if (numberOfDays < 30) {
      priceType = [1, 7];
    } else {
      priceType = [2, 30];
    }

    var pricePerUnit = ROOMS_PRICES[booking.room][priceType[0]];
    var price = pricePerUnit * (numberOfDays/priceType[1]) * booking.number_of_guests;;
    return Math.round(price);
  }
//TODO: strip.
  convertBookingToJSON = function(bookingObject) {
    var booking = bookingObject.toJSON();
    if (booking.start) {
      booking.start = removeTime(new Date(booking.start.iso));
    }
    if (booking.end) {
      booking.end = removeTime(new Date(booking.end.iso));
    }
    return booking;
  }

  function removeTime(date) {
    date.setHours(0,0,0,0);
    return date;
  }

  function getBookingEvents(start, end, callback) {
    var query = new Parse.Query(Booking);
    query.find({success:function(bookingObjects) {
      var bookings = bookingObjects.map(convertBookingToJSON);
      var events = [];
      for (var i = 0; i < bookings.length; i++) {
        events.push(bookings[i]);
      }
      callback(events);
    }});  
  }

  // TODO: unit-test.
  function checkIfAvailable(booking, callback) {
    getFreeSapces(booking.start, booking.end, function(freeSpace) {
      for (var date in freeSpace) {
        if (freeSpace[date.toString()][booking.room] < booking.number_of_guests) {
          callback(false);
          return;
        }
      }
      callback(true);
    });
  }

  function getFreeSapcesEvents(start, end, callback){
    getFreeSapces(removeTime(new Date(start)), removeTime(new Date(end)), function(freeSpace) {
      var events = [];
      for (var date in freeSpace) {
        for(var room in freeSpace[date.toString()]){
          events.push({start:date, title: "[" + room + ": " + freeSpace[date.toString()][room] + "]"});
        }
      }
      callback(events);
    });
  }

  // UI: 
  // Set Rooms in Select.
  for (var i = 0; i < ROOMS.length; i++) {
    $('#room').append("<option>"+ROOMS[i][0]+"</option>");
  };
  // Set Calendar.
  $('#calendar').fullCalendar({header: {left: 'prev,next today',center: 'title', right: 'month,basicWeek,basicDay'},
                                 editable: true,
                                 eventSources: [
                                  {events:getBookingEvents, color: 'yellow', textColor: 'black'},
                                  {events:getFreeSapcesEvents}]}); 
  // Setup Date pickers:
  $('#datetimepickerStart').datetimepicker({
      language: 'en'
  });
  var startPicker = $('#datetimepickerStart').data('datetimepicker');
  startPicker.setLocalDate(new Date());
  $('#datetimepickerEnd').datetimepicker({
      language: 'en'
  });
  var endPicker = $('#datetimepickerEnd').data('datetimepicker');
  endPicker.setLocalDate(new Date());

  // Save new booking event
  $("#place-booking").click(placeBooking);
  
  function placeBooking(event){
    debugger;
    // 1. Create the booking from the input:
    var booking = createBookingFromInput();

    // 2. Get Credit Card details:
    StripeCheckout.open({
      key:         'pk_test_hfqcvD791OD2SqlsBxINKbPw',
      email: true,
      amount:      Number(booking.get("price"))*100,
      name:        booking.get("guest_name"),
      description: 'Book your room',
      panelLabel:  'Checkout',
      // 3. Set the token and send to the server to charge and book:
      token: function(token) {
        debugger;
        booking.set("cardToken",token.id);
        booking.save({success: function(toekn){
          //TODO(gutman): give better feedback.
          location.reload();
        }});
      }
    });
    return false;
  };

  $("#place-booking").hide();
  $('#show-price').click(function(){
    var booking = convertBookingToJSON(createBookingFromInput());
    checkIfAvailable(booking, function(isAvailable){
      if(isAvailable) {
        //TODO(gutman): make it nicer:
        price = calculatePrice(booking);
        $('#price').html("Available: " + price + "$ total"); 
        $("#place-booking").show();
      } else {
        $('#price').html("Not available. See calendar for more details"); 
        $("#place-booking").hide();
      }
    })
  })



  // Handle Stripe:
  // This identifies your website in the createToken call below
  Stripe.setPublishableKey('pk_test_hfqcvD791OD2SqlsBxINKbPw');
 
    var stripeResponseHandler = function(status, response) {
      var $form = $('#payment-form');
 
      if (response.error) {
        // Show the errors on the form
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
      } else {
        // token contains id, last4, and card type
        var token = response.id;
        // Insert the token into the form so it gets submitted to the server
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));
        // and re-submit
        $form.get(0).submit();
      }
    };
 
    jQuery(function($) {
      $('#payment-form').submit(function(e) {
        var $form = $(this);
 
        // Disable the submit button to prevent repeated clicks
        $form.find('button').prop('disabled', true);
 
        Stripe.createToken($form, stripeResponseHandler);
 
        // Prevent the form from submitting with the default action
        return false;
      });
    });
