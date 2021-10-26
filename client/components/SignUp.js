import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import { Button as MaterialButton, Box } from "@material-ui/core";
import queryString from "query-string";
import SimpleSchema from "simpl-schema";
import useReactoForm from "reacto-form/cjs/useReactoForm";
import Random from "@reactioncommerce/random";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SignUpWithGoogle, signInWithFacebook } from "../../services/auth";

/**
 * @summary Does `Accounts.createUser` followed by
 *   calling the "oauth/login" method.
 * @param {Object} input Input
 * @param {String} [input.challenge] Challenge to pass to the "oauth/login" method
 *   after logging in.
 * @param {String} input.email Email address to pass to `Accounts.createUser`
 * @param {String} input.password Password to pass to `Accounts.createUser`
 * @return {Promise<String|undefined>} Redirect URL or `undefined` if no
 *   `challenge` argument was passed.
 */
function callSignUp({
  challenge,
  email,
  password,
  firstName,
  lastName,
  phone,
}) {
  return new Promise((resolve, reject) => {
    Accounts.createUser(
      {
        email,
        password,
        profile: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          phone,
        },
      },
      (error) => {
        if (error) {
          reject(error);
        } else {
          if (!challenge) {
            resolve();
            return;
          }
          // Meteor.call("oauth/updateUserInfo", { firstName, lastName }, (err) => {
          //   if (err) {
          //     reject(err);
          //   }
          // });
          Meteor.call(
            "oauth/login",
            { challenge },
            (oauthLoginError, redirectUrl) => {
              if (oauthLoginError) {
                reject(oauthLoginError);
              } else {
                resolve(redirectUrl);
              }
            }
          );
        }
      }
    );
  });
}

const useStyles = makeStyles(() => ({
  inlineAlert: {
    marginBottom: 16,
  },
  pageTitle: {
    color: "#1999dd",
    fontFamily:
      "'Source Sans Pro', 'Roboto', 'Helvetica Neue', Helvetica, sans-serif",
    fontSize: 30,
    fontWeight: 400,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "100%",
  },
}));

const formSchema = new SimpleSchema({
  email: {
    type: String,
    min: 3,
  },
  password: {
    type: String,
    min: 6,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
    optional: true,
  },
  phone: {
    type: String,
  },
});
const validator = formSchema.getFormValidator();

/**
 * @summary SignUp React component
 * @param {Object} props Component props
 * @return {React.Node} Rendered component instance
 */
function SignUp() {
  const { t } = useTranslation(); // eslint-disable-line id-length
  const uniqueId = useMemo(() => Random.id(), []);
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [value, setValue] = useState({});

  const { login_challenge: challenge } = queryString.parse(location.search);

  const signUpWithFacebook = async () => {
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
  };

  const signUpWithGoogle = async () => {
    setIsSubmitting(true);
    let redirectUrl;
    try {
      redirectUrl = await SignUpWithGoogle({ challenge, ...value });
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
      return { ok: false };
    }
    setIsSubmitting(false);

    if (redirectUrl) window.location.href = redirectUrl;
    return { ok: true };
  };

  const { getErrors, getInputProps, submitForm } = useReactoForm({
    async onSubmit(formData) {
      setIsSubmitting(true);
      let redirectUrl;
      try {
        redirectUrl = await callSignUp({ challenge, ...formData });
      } catch (error) {
        setSubmitError(error.message);
        setIsSubmitting(false);
        return { ok: false };
      }
      setIsSubmitting(false);
      if (redirectUrl) window.location.href = redirectUrl;
      return { ok: true };
    },
    validator,
    onChange(formData) {
      setValue(formData);
    },
  });

  return (
    <div>
      <div className={classes.pageTitle}>{t("createAccount")}</div>

      <Field
        errors={getErrors(["firstName"])}
        isRequired
        label={"Nombres"}
        labelFor={`firstName-${uniqueId}`}
        name="firstName"
      >
        <TextInput
          type="text"
          id={`firstName-${uniqueId}`}
          {...getInputProps("firstName")}
        />
        <ErrorsBlock errors={getErrors(["firstName"])} />
      </Field>
      <Field
        errors={getErrors(["lastName"])}
        label={"Apellidos"}
        labelFor={`lastName-${uniqueId}`}
        name="lastName"
      >
        <TextInput
          type="text"
          id={`lastName-${uniqueId}`}
          {...getInputProps("lastName")}
        />
        <ErrorsBlock errors={getErrors(["lastName"])} />
      </Field>
      <Field
        errors={getErrors(["phone"])}
        label={"Télefono"}
        labelFor={`phone-${uniqueId}`}
        name="phone"
      >
        <TextInput
          type="number"
          id={`phone-${uniqueId}`}
          {...getInputProps("phone")}
        />
        <ErrorsBlock errors={getErrors(["phone"])} />
      </Field>
      <Field
        errors={getErrors(["email"])}
        isRequired
        label={t("emailAddress")}
        labelFor={`email-${uniqueId}`}
        name="email"
      >
        <TextInput
          type="email"
          id={`email-${uniqueId}`}
          {...getInputProps("email")}
        />
        <ErrorsBlock errors={getErrors(["email"])} />
      </Field>
      <Field
        errors={getErrors(["password"])}
        isRequired
        label={t("password")}
        labelFor={`password-${uniqueId}`}
        name="password"
      >
        <TextInput
          type="password"
          id={`password-${uniqueId}`}
          {...getInputProps("password")}
        />
        <ErrorsBlock errors={getErrors(["password"])} />
      </Field>

      {submitError && (
        <InlineAlert
          alertType="error"
          className={classes.inlineAlert}
          message={submitError}
        />
      )}

      <Button
        actionType="important"
        isFullWidth
        isWaiting={isSubmitting}
        onClick={submitForm}
      >
        {t("signUpButton")}
      </Button>
      <Button
        isDisabled={isSubmitting}
        isFullWidth
        isShortHeight
        isTextOnly
        onClick={() => {
          history.push({ pathname: "/account/login", search: location.search });
        }}
      >
        {t("signIn")}
      </Button>
      <hr></hr>
        <small style={{
          textAlign: "center",
          color: "#737373",
          fontFamily: "'Source Sans Pro','Helvetica Neue',Helvetica,sans-serif"
        }}>Para registrarse con google los siguientes campos son requeridos (Primer Nombre, Teléfono)</small>
      {/* <Box paddingTop={2}>
        <MaterialButton
          variant="outlined"
          active={isSubmitting}
          onClick={signUpWithFacebook}
          className={classes.button}
          startIcon={
            <img
              alt=""
              src="https://firebasestorage.googleapis.com/v0/b/twowheelstogo-572d7.appspot.com/o/resources%2Ffb.png?alt=media&token=d52db856-b93a-4c9b-896c-53a9d29ed2cd"
              width={20}
              height={20}
            />
          }
        >
          {t("signUpWithFacebook")}
        </MaterialButton>
      </Box> */}
      <Box paddingTop={2}>
        <MaterialButton
          variant="outlined"
          active={isSubmitting}
          onClick={signUpWithGoogle}
          className={classes.button}
          startIcon={
            <img
              alt=""
              src="https://firebasestorage.googleapis.com/v0/b/twowheelstogo-572d7.appspot.com/o/resources%2Fgoogle.png?alt=media&token=a7f6ec8a-bc84-4235-8a57-38d10c027ec7"
              width={20}
              height={20}
            />
          }
        >
          {t("signUpWithGoogle")}
        </MaterialButton>
      </Box>
    </div>
  );
}

export default SignUp;
