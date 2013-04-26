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
        logging.info('paying');
        logging.info('stringtoken: ' + self.request.get('stripeToken'))
        if self.request.get('stripeToken') and self.request.get('amount'):
            try:
            	charge = stripe.Charge.create(
    	      		amount = self.request.get('amount'),
    	      		currency = "usd",
    	      		card = self.request.get('stripeToken'),
                    description = self.request.get('description')
      			);
            except Exception, e:
            	self.redirect('/fail')
            else:
            	self.redirect('/success')
        else:
            logging.info('no token!')
            self.redirect('/server-error')
    	

app = webapp2.WSGIApplication([
    ('/charge', MainHandler)
], debug=True)
