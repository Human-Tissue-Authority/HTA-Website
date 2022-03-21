import React, { useState } from 'react'
import { createPortal } from "react-dom"
import { Link } from 'gatsby'
import { animated, useSpring, config } from 'react-spring'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { object, string, boolean } from 'yup'
import { encode } from 'js-base64'
import ReCAPTCHA from 'react-google-recaptcha';

import { verifyRecaptcha } from '../../utils/utils'

import ArrowPurple from '../../images/arrow-purple.svg'
import SubmitButton from './elements/submitButton'
import SubmissionModal from './elements/submissionModal'

const SubscribeEstablishment = props => {
  const { nid } = props
  const [recaptchaValue, setRecaptchaValue] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // fade in subscribe form
  const animationAside = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 }
  })

  // handle form submission
  const handleFormSubmission = async (values, actions) => {
    if (values.email_address === values.confirm_email_address) {
      const SUBMISSION_ENDPOINT = `${process.env.API_ROOT}/webform_rest/submit?_format=json`
      const headers = new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      })

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        confirm_email_address: values.email_address,
        i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo: values.i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo,
        establishment: nid,
        webform_id: 'subscribe_to_establishment_updat'
      }

      // pass basic auth token if production environment
      if (process.env.NODE_ENV === 'production') {
        const authUser = process.env.AUTH_USER
        const authPass = process.env.AUTH_PASS
        const authToken = encode(`${authUser}:${authPass}`)

        headers.append('Authorization',`Basic ${authToken}`)
      }

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }

      const recaptchaResponse = await verifyRecaptcha(recaptchaValue);

      if (recaptchaResponse.success) {
        try {
          const response = await fetch(SUBMISSION_ENDPOINT, options)

          if (response.ok) {
            // submission successful
            const data = await response.json()

            if (typeof data.error !== 'undefined') {
              // Error returned from Drupal while trying to process the request.
              actions.setStatus({
                error: true,
                message: data.error.message,
              })
            } else {
              setShowModal(true)
              actions.setStatus({
                success: true,
                message: 'Thanks. We will get back to you shortly.',
              })
            }
          } else {
            // Error connecting to Drupal, e.g. the server is unreachable.
            actions.setStatus({
              error: true,
              message: `${response.status}: ${response.statusText}`,
            })
          }
        } catch (e) {
          actions.setStatus({
            error: true,
            message: e.message,
          })
        }
      } else {
        actions.setStatus({
          error: true,
          message: 'reCAPTCHA verification failed. Please try again.',
        })
      }
    } else {
      actions.setStatus({
        error: true,
        message: 'Please ensure both emails are the same.',
      })
    }

    actions.setSubmitting(false)
  }

  const handleRecaptcha = value => {
    setRecaptchaValue(value);
  }

  return (
    <>
      <animated.div
        style={animationAside}
        className="subscribe-establishment column is-4"
      >
        <div className="subscribe-establishment__inner-wrapper">

          <div className="subscribe-establishment__establishments-link">
            <img src={ArrowPurple} role="presentation" alt="" />
            <Link to="/professional/establishments">
              Back to establishments
            </Link>
          </div>

          <h2 className="h section-title">
            Sign up to receive updates for this establishment
          </h2>

          <Formik
            initialValues={{
              first_name: '',
              last_name: '',
              email_address: '',
              confirm_email_address: '',
              i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo: false
            }}
            validationSchema={object({
              first_name: string().required('Please provide a first name'),
              last_name: string().required('Please provide a last name'),
              email_address: string().email('Invalid email address').required('Please enter your email address'),
              confirm_email_address: string().email('Invalid email address').required('Please confirm your email address'),
              i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo: boolean()
                .required('Please consent to our privacy policy to sign up')
                .oneOf([true], 'Please consent to our privacy policy to sign up')
            })}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values, actions) => {
              handleFormSubmission(values, actions)
            }}
          >
            {({ handleReset, isSubmitting, isValidating, status, errors }) => (
              <Form>
                {errors && Object.keys(errors).length > 0 && (
                  <div className="form-error" aria-live="polite" role="alert">
                    Please fill in all fields
                  </div>
                )}

                <fieldset>
                  <legend><span className="accessibility">Sign up to receive updates for this establishment</span></legend>
                  <p id="formInstructions">Fields marked with an asterisk (*) are required.</p>

                  <div className={`field field--first_name ${errors.first_name ? 'field--invalid' : ''}`}>
                    <label htmlFor="first_name" aria-label="First name (required)">First name*</label>
                    <Field id="first_name" type="text" name="first_name" autoComplete="given-name" />
                    <ErrorMessage
                      name="first_name"
                      component="span"
                      aria-live={errors?.first_name ? "polite" : null}
                      role={errors?.first_name ? "alert" : null}
                    />
                  </div>

                  <div className={`field field--last_name ${errors.last_name ? 'field--invalid' : ''}`}>
                    <label htmlFor="last_name" aria-label="Last name (required)">Last name*</label>
                    <Field id="last_name" type="text" name="last_name" autoComplete="family-name" aria-required="true" />
                    <ErrorMessage
                      name="last_name"
                      component="span"
                      aria-live={errors?.last_name ? "polite" : null}
                      role={errors?.last_name ? "alert" : null}
                    />
                  </div>

                  <div className={`field field--email_address ${errors.email_address ? 'field--invalid' : ''}`}>
                    <label htmlFor="email_address" aria-label="Email address (required)">Email address*</label>
                    <Field id="email_address" type="email" name="email_address" autoComplete="email" aria-required="true" />
                    <ErrorMessage
                      name="email_address"
                      component="span"
                      aria-live={errors?.email_address ? "polite" : null}
                      role={errors?.email_address ? "alert" : null}
                    />
                  </div>

                  <div className={`field field--confirm_email_address ${errors.confirm_email_address ? 'field--invalid' : ''}`}>
                    <label htmlFor="confirm_email_address" aria-label="Confirm email address (required)">Confirm email address*</label>
                    <Field id="confirm_email_address" type="email" name="confirm_email_address" aria-required="true" />
                    <ErrorMessage
                      name="confirm_email_address"
                      component="span"
                      aria-live={errors?.confirm_email_address ? "polite" : null}
                      role={errors?.confirm_email_address ? "alert" : null}
                    />
                  </div>

                  <div className={`field field--consent ${errors.i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo ? 'field--invalid' : ''}`}>
                    <div className="field__inner-wrapper">
                      <Field id="consent" type="checkbox" name="i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo" aria-required="true" />
                      <label htmlFor="consent">
                        I would like to be notified when any new reports are uploaded for this establishment and I can confirm that I have read the <Link to="/privacy-notice">privacy policy</Link>.*
                      </label>
                    </div>
                    <ErrorMessage
                      name="i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo"
                      component="span"
                      aria-live={errors?.i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo ? "polite" : null}
                      role={errors?.i_would_like_to_be_notified_when_any_new_reports_are_uploaded_fo ? "alert" : null}
                    />
                  </div>
                </fieldset>

                <ReCAPTCHA
                  sitekey={process.env.RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptcha}
                  className="field--recaptcha"
                  theme="dark"
                />

                <SubmitButton
                  text="Sign up"
                  isSubmitting={isSubmitting}
                  isValidating={isValidating}
                  status={status}
                  errors={errors}
                  showArrow
                />
              </Form>
            )}
          </Formik>
        </div>
      </animated.div>

      {/* Submission Successful Modal Portal */}
      {showModal && createPortal(
        <SubmissionModal
          successTitle="You are now subscribed to this establishment."
          buttonText="Close"
          buttonAria="Close modal window"
          buttonAction={() => window.location.reload()}
        />,
        document.body
      )}
    </>
  )
}

export default SubscribeEstablishment
