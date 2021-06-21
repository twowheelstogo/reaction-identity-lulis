import { Meteor, } from "meteor/meteor";
import{ ServiceConfiguration} from "meteor/service-configuration";
import Logger from "@reactioncommerce/logger";
import config from "./config.js";
import { oauthLogin,checkIfUserExists,extendFbUser,extendGoogleUser } from "./oauthMethods.js";

Meteor.methods({
  "getGraphQLApiUrl": () => config.API_URL,
  "oauth/login": oauthLogin,
  "oauth/checkIfUserExists":checkIfUserExists,
  "oauth/extendFbUser":extendFbUser,
  "oauth/extendGoogleUser":extendGoogleUser
});

// Init endpoints
import "./i18n/handler.js";
import "./oauthEndpoints.js";

Meteor.startup(() => {
  Logger.info(`Serving Reaction Identity at ${config.ROOT_URL}`);
});
ServiceConfiguration.configurations.insert(
  {service:'facebook'},
  {
    $set:{
      appId:config.FACEBOOK_APP_ID,
      secret:config.FACEBOOK_SECRET,
      loginStyle: "popup",
    }
  },
)
ServiceConfiguration.configurations.remove({service:'google'});
ServiceConfiguration.configurations.insert({
  service:'google',
  clientId:config.GOOGLE_CLIENT_ID,
  secret:config.GOOGLE_SECRET
})