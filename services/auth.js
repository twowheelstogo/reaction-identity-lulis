import {Meteor} from "meteor/meteor";
export function signInWithFacebook({challenge}){
    return new Promise((resolve,reject)=>{
        Meteor.loginWithFacebook({
            requestPermissions:['email']
        },async(err)=>{
            if(err){
                reject(err);
            }else if(!challenge){
                resolve();
                return;
            }
            Meteor.call("oauth/extendFbUser",(err)=>{
                if(err){
                    reject(err);
                }
                Meteor.call("oauth/login", { challenge }, (oauthLoginError, redirectUrl) => {
                    if (oauthLoginError) {
                      reject(oauthLoginError);
                    } else {
                      resolve(redirectUrl);
                    }
                  });
            });
        })
    })
}
export function signInWithGoogle({challenge}){
    return new Promise((resolve,reject)=>{
        Meteor.loginWithGoogle({
            requestPermissions:['email'],
        },(err)=>{
            if(err){
                reject(err);
            }else if(!challenge){
                resolve();
                return;
            }
            Meteor.call("oauth/extendGoogleUser",(err)=>{
                if(err){
                    reject(err);
                }
                Meteor.call("oauth/login", { challenge }, (oauthLoginError, redirectUrl) => {
                    if (oauthLoginError) {
                      reject(oauthLoginError);
                    } else {
                      resolve(redirectUrl);
                    }
                  });
            });
        })
    })
}