import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import queryString from "query-string";
import SimpleSchema from "simpl-schema";
import useReactoForm from "reacto-form/cjs/useReactoForm";
import Random from "@reactioncommerce/random";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { Meteor } from "meteor/meteor";
/**
 * @summary Does `Meteor.loginWithPassword` followed by
 *   calling the "oauth/login" method.
 * @param {Object} input Input
 * @param {String} [input.challenge] Challenge to pass to the "oauth/login" method
 *   after logging in.
 * @param {String} input.email Email address to pass to `Meteor.loginWithPassword`
 * @param {String} input.password Password to pass to `Meteor.loginWithPassword`
 * @return {Promise<String|undefined>} Redirect URL or `undefined` if no
 *   `challenge` argument was passed.
 */
function callSignIn({ challenge, firstName, lastName, phone }) {
    return new Promise((resolve, reject) => {
        Meteor.call("oauth/updateUserInfo", { firstName, lastName, phone }, (err) => {
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
    });
}
const useStyles = makeStyles(() => ({
    inlineAlert: {
        marginBottom: 16
    },
    logo: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: "50px"
    },
    pageTitle: {
        color: "#0095b3",
        fontFamily: "'Source Sans Pro', 'Roboto', 'Helvetica Neue', Helvetica, sans-serif",
        fontSize: 30,
        fontWeight: 400,
        marginBottom: 40,
        textAlign: "center"
    },
    button: {
        width: '100%'
    }
}));

const formSchema = new SimpleSchema({
    firstName: {
        type: String
    },
    lastName: {
        type: String,
        optional: true
    },
    phone: {
        type: String
    }
});
const validator = formSchema.getFormValidator();

/**
 * @summary CreateAccount React component
 * @param {Object} props Component props
 * @return {React.Node} Rendered component instance
 */
function CreateAccount() {
    const { t } = useTranslation(); // eslint-disable-line id-length
    const uniqueId = useMemo(() => Random.id(), []);
    const classes = useStyles();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const { login_challenge: challenge } = queryString.parse(location.search);

    const {
        getErrors,
        getInputProps,
        submitForm
    } = useReactoForm({
        async onSubmit(formData) {
            setIsSubmitting(true);
            let redirectUrl;
            try {
                redirectUrl = await callSignIn({ challenge, ...formData });
            } catch (error) {
                setSubmitError(error.message);
                setIsSubmitting(false);
                return { ok: false };
            }
            setIsSubmitting(false);
            if (redirectUrl) window.location.href = redirectUrl;
            return { ok: true };
        },
        validator
    });

    const date = new Date();

    return (
        <div>
            <div className={classes.logo}>
                <img
                    src={logo}
                    width={100}
                />
            </div>
            <div className={classes.pageTitle}>
                {"Crear Cuenta"}
            </div>

            <Field
                isRequired
                errors={getErrors(["firstName"])}
                name="firstName"
                label={"Nombres"}
                labelFor={`firstName-${uniqueId}`}
            >
                <TextInput
                    type="text"
                    id={`firstName-${uniqueId}`}
                    {...getInputProps("firstName")}
                />
                <ErrorsBlock errors={getErrors(["firstName"])} />
            </Field>
            <Field
                isRequired
                errors={getErrors(["lastName"])}
                name="lastName"
                label={"Apellidos"}
                labelFor={`lastName-${uniqueId}`}
            >
                <TextInput
                    type="text"
                    id={`lastName-${uniqueId}`}
                    {...getInputProps("lastName")}
                />
                <ErrorsBlock errors={getErrors(["lastName"])} />
            </Field>
            <Field
                isRequired
                errors={getErrors(["phone"])}
                name="phone"
                label={"Teléfono"}
                labelFor={`phone-${uniqueId}`}
            >
                <TextInput
                    type="number"
                    id={`phone-${uniqueId}`}
                    {...getInputProps("phone")}
                />
                <ErrorsBlock errors={getErrors(["phone"])} />
            </Field>

            {submitError &&
                <InlineAlert
                    alertType="error"
                    className={classes.inlineAlert}
                    message={submitError}
                />
            }

            <Button
                actionType="important"
                isFullWidth
                isWaiting={isSubmitting}
                onClick={submitForm}
            >
                {"Crear Cuenta"}
            </Button>
            <div
                style={{
                    textAlign: "center",
                    color: "#737373",
                    fontFamily: "'Source Sans Pro','Helvetica Neue',Helvetica,sans-serif",
                    padding: "10px"
                }}
            >
                <small>© {date.getFullYear()} Qubit Systems</small>
            </div>
        </div>
    );
}
const logo = "https://firebasestorage.googleapis.com/v0/b/twowheelstogo-572d7.appspot.com/o/resources%2FArtboard%201.png?alt=media&token=d217eb7f-efbe-4519-8bfa-1130b1725331";


export default CreateAccount;
