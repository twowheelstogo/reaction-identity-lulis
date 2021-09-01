import { Meteor } from "meteor/meteor";
export function signInWithFacebook({ challenge }) {
    return new Promise((resolve, reject) => {
        Meteor.loginWithFacebook({
            requestPermissions: ['email', 'public_profile']
        }, async (err) => {
            if (err) {
                reject(err);
            } else if (!challenge) {
                resolve();
                return;
            }
            Meteor.call("oauth/extendFbUser", (err) => {
                if (err) {
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
export function signInWithGoogle({ challenge }) {
    return new Promise((resolve, reject) => {
        Meteor.loginWithGoogle({
            requestPermissions: ['email'],
        }, (err) => {
            if (err) {
                reject(err);
            } else if (!challenge) {
                resolve();
                return;
            }
            Meteor.call("oauth/extendGoogleUser", (err) => {
                if (err) {
                    reject(err);
                }
                Meteor.call("oauth/isNewUser", (usrErr, isNew) => {
                    if (usrErr) {
                        reject(usrErr);
                    }

                    if (isNew) {
                        resolve({ isNew });
                    }
                    else {

                        Meteor.call("oauth/login", { challenge }, (oauthLoginError, redirectUrl) => {
                            console.log(oauthLoginError);
                            if (oauthLoginError) {
                                reject(oauthLoginError);
                            } else {
                                resolve({ redirectUrl, isNew: false });
                            }
                        });
                    }
                })
            });
        })
    })
}

export function SignUpWithGoogle({ challenge, firstName, lastName }) {
    console.log("challenge", challenge);
    return new Promise((resolve, reject) => {
        if (!firstName) reject(new Error("El campo 'Primer Nombre' es requerido!"));
        else {
            Meteor.loginWithGoogle({
                requestPermissions: ["email"]
            }, (err) => {
                if (err) {
                    reject(err);
                } else if (!challenge) {
                    resolve();
                    return;
                }
                Meteor.call("oauth/extendGoogleUser", (googleErr) => {
                    if (googleErr) {
                        reject(googleErr);
                    }
                    console.log("user extended");
                    Meteor.call("oauth/updateUserInfo", { firstName, lastName }, (usrErr) => {
                        if (usrErr) {
                            reject(usrErr);
                        }
                        console.log("user updated");
                        Meteor.call("oauth/login", { challenge }, (oauthLoginError, redirectUrl) => {
                            console.log(oauthLoginError);
                            if (oauthLoginError) {
                                reject(oauthLoginError);
                            } else {
                                resolve(redirectUrl);
                            }
                        });
                    });
                });
            });
        }
    });
}