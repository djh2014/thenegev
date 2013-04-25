#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import logging
import stripe

stripe.api_key = "sk_test_ZToG0PyWTopFzvE0IJsJik2Q" 

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write("I'm not a page!")
        try:
        	charge = stripe.Charge.create(
	      		amount = 10000 * 100,
	      		currency = "usd",
	      		card = {
	      		    'number': 4012888888881881,
	    			'cvc': 123,
	    			'exp_month': 02,
	    			'exp_year': 2015
	      		},
	     		description = "abgutman4@gmail.com"
  			);
        except Exception, e:
        	self.redirect('/fail');
        else:
        	self.redirect('/success');
        
    def post(self):
    	logging.info('paying');
    	

app = webapp2.WSGIApplication([
    ('/charge', MainHandler)
], debug=True)
