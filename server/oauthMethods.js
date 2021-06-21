import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import config from "./config.js";
import hydra from "./hydra.js";

const { HYDRA_SESSION_LIFESPAN } = config;

/**
 * @name oauthLogin
 * @method
 * @param  {Object} options - options passed from client call
 * @param {String} options.challenge Used to fetch information about the login request from Hydra.
 * @param {Boolean} options.remember tells hydra to remember the browser and automatically authenticate the user in future requests
 * @returns {String} redirectUrl
 */
export function oauthLogin(options) {
  check(options, Object);
  check(options.challenge, String);
  check(options.remember, Match.Maybe(Boolean));
  const { challenge, remember = true } = options;

  if (!this.userId) throw new Meteor.Error("Access Denied");

  return hydra
    .acceptLoginRequest(challenge, {
      subject: this.userId,
      remember,
      // `remember` tells Hydra to remember this login and reuse it if the same user on the same
      // client tries to log-in again. Ideally, this should be longer than token lifespan.
      // Set default is 24 hrs (set in seconds). Depending on preferred setup, you can allow
      // users decide if to enable or disable.
      // eslint-disable-next-line camelcase
      remember_for: HYDRA_SESSION_LIFESPAN
    })
    .then((response) => {
      // Now that we are done with the Meteor Accounts login session, log out. According to Hydra docs,
      // the Identity Server must not implement any kind of session or remember the user in any way.
      Meteor.call("logout");

      // The return the redirect URL to the browser so it can navigate there
      return response.redirect_to;
    })
    .catch((error) => {
      Logger.error(error);
      throw error;
    });
}
export function checkIfUserExists(userId){
    return(Meteor.users.findOne({_id:userId})) ?true :false;
}
export function extendFbUser(){
  var user = Meteor.user();
  if (user.hasOwnProperty('services') && user.services.hasOwnProperty('facebook')  ) {
    var fb = user.services.facebook;
    // var result = Meteor.('https://graph.facebook.com/v2.4/' + fb.id + '?access_token=' + fb.accessToken + '&fields=name,email');
    Meteor.users.update({_id: user._id}, {
      $addToSet: { "emails": {
        'address': fb.email,
        'verified': false
      }}
    });
  }
}
export function extendGoogleUser(){
  var user = Meteor.user();
  if (user.hasOwnProperty('services') && user.services.hasOwnProperty('google')  ) {
    var google = user.services.google;
    // var result = Meteor.('https://graph.facebook.com/v2.4/' + fb.id + '?access_token=' + fb.accessToken + '&fields=name,email');
    Meteor.users.update({_id: user._id}, {
      $addToSet: { "emails": {
        'address': google.email,
        'verified': false
      }}
    });
  }
}