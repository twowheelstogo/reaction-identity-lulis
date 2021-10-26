import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
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
import { signInWithFacebook, signInWithGoogle } from "../../services/auth.js";
import { Button as MaterialButton, Box } from "@material-ui/core"
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
function callSignIn({ challenge, email, password }) {
  return new Promise((resolve, reject) => {
    Meteor.loginWithPassword(email, password, (meteorLoginError) => {
      if (meteorLoginError) {
        reject(meteorLoginError);
      } else {
        if (!challenge) {
          resolve();
          return;
        }
        Meteor.call("oauth/login", { challenge }, (oauthLoginError, redirectUrl) => {
          if (oauthLoginError) {
            reject(oauthLoginError);
          } else {
            resolve(redirectUrl);
          }
        });
      }
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
  email: {
    type: String,
    min: 3
  },
  password: {
    type: String
  }
});
const validator = formSchema.getFormValidator();

/**
 * @summary SignIn React component
 * @param {Object} props Component props
 * @return {React.Node} Rendered component instance
 */
function SignIn() {
  const { t } = useTranslation(); // eslint-disable-line id-length
  const uniqueId = useMemo(() => Random.id(), []);
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { login_challenge: challenge } = queryString.parse(location.search);
  const authWithFacebook = async () => {
    setIsSubmitting(true);
    let redirectUrl;
    try {
      redirectUrl = await signInWithFacebook({ challenge });
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
      return { ok: false };
    }
    setIsSubmitting(false);
    if (redirectUrl) window.location.href = redirectUrl;
    return { ok: true };
  }
  const authWithGoogle = async () => {
    setIsSubmitting(true);
    let result;
    try {
      result = await signInWithGoogle({ challenge });
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
      return { ok: false };
    }
    setIsSubmitting(false);
    if (result.isNew) history.push(`/account/create?login_challenge=${challenge}`);

    if (result.redirectUrl && !result.isNew) window.location.href = result.redirectUrl;
    return { ok: true };
  }
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
        {t("signIn")}
      </div>

      <Field
        isRequired
        errors={getErrors(["email"])}
        name="email"
        label={t("emailAddress")}
        labelFor={`email-${uniqueId}`}
      >
        <TextInput
          type="email"
          id={`email-${uniqueId}`}
          {...getInputProps("email")}
        />
        <ErrorsBlock errors={getErrors(["email"])} />
      </Field>
      <Field
        isRequired
        errors={getErrors(["password"])}
        name="password"
        label={t("password")}
        labelFor={`password-${uniqueId}`}
      >
        <TextInput
          type="password"
          id={`password-${uniqueId}`}
          {...getInputProps("password")}
        />
        <ErrorsBlock errors={getErrors(["password"])} />
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
        {t("signIn")}
      </Button>

      <Button
        isDisabled={isSubmitting}
        isFullWidth
        isShortHeight
        isTextOnly
        onClick={() => { history.push({ pathname: "/account/forgot-password", search: location.search }); }}
      >
        {t("forgotPassword")}
      </Button>
      <Button
        isDisabled={isSubmitting}
        isFullWidth
        isShortHeight
        isTextOnly
        onClick={() => { history.push({ pathname: "/account/enroll", search: location.search }); }}
      >
        {t("signUp")}
      </Button>
      {/* <Box paddingTop={1}>
        <MaterialButton
          variant="outlined"
          active={isSubmitting}
          onClick={authWithFacebook}
          className={classes.button}
          startIcon={
            <img alt='' src="https://firebasestorage.googleapis.com/v0/b/twowheelstogo-572d7.appspot.com/o/resources%2Ffb.png?alt=media&token=d52db856-b93a-4c9b-896c-53a9d29ed2cd"
              width={20} height={20} />
          }
        >
          {t("signInWithFacebook")}
        </MaterialButton>
      </Box> */}
      <Box paddingTop={1}>
        <MaterialButton
          variant="outlined"
          active={isSubmitting}
          onClick={authWithGoogle}
          className={classes.button}
          startIcon={
            <img alt='' src="https://firebasestorage.googleapis.com/v0/b/twowheelstogo-572d7.appspot.com/o/resources%2Fgoogle.png?alt=media&token=a7f6ec8a-bc84-4235-8a57-38d10c027ec7"
              width={20} height={20} />
          }
        >
          {t("signInWithGoogle")}
        </MaterialButton>
      </Box>
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

export default SignIn;
