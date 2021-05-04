import React, { useState, forwardRef } from 'react'
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

const MIN_HEIGHT_FORM = 800

const FollowBlog = forwardRef((props, ref) => {
  const { nid, column, showBackButton = true } = props
  const [recaptchaValue, setRecaptchaValue] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // fade in subscribe form
  const animationAside = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1}
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
        last_name: values.field_last_name,
        email_address: values.email_address,
        blog: nid,
        submitted_to: nid,
        i_would_like_to_be_notified_when_any_new_blog_posts_are_added_an: values.field_i_would_like_to_follow_the,
        webform_id: 'follow_the_hta_blog'
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
        className={`follow-blog column is-${column || 4}`}
      >
        <div className="follow-blog__inner-wrapper" ref={ref} style={{minHeight: MIN_HEIGHT_FORM + 'px'}}>
          {showBackButton && (
            <div className="follow-blog__link">
              <img src={ArrowPurple} role="presentation" alt="" />
              <Link to="/blog">
                Back to blog
              </Link>
            </div>
          )}

          <h2 className={`section-title${showBackButton ? ' offset-top' : ' offset-top-increased'}`}>
            Follow the HTA Blog
          </h2>

          <Formik
            initialValues={{
              first_name: '',
              field_last_name: '',
              email_address: '',
              confirm_email_address: '',
              field_i_would_like_to_follow_the: false
            }}
            validationSchema={object({
              first_name: string().required('Please provide a first name'),
              field_last_name: string().required('Please provide a last name'),
              email_address: string().email('Invalid email address').required('Please enter your email address'),
              confirm_email_address: string().email('Invalid email address').required('Please confirm your email address'),
              field_i_would_like_to_follow_the: boolean()
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

                {status?.error && (
                  <div className="form-error" aria-live="polite" role="alert">
                    {status.message}
                  </div>
                )}

                <fieldset>
                  <legend><span className="accessibility">Follow the HTA Blog</span></legend>

                  <div className={`field field--field-component ${errors.first_name ? 'field--invalid' : ''}`}>
                    <label htmlFor="first_name_follow" aria-label="First name (required)">First name*</label>
                    <Field id="first_name_follow" type="text" name="first_name" autoComplete="given-name" />
                    <ErrorMessage name="first_name" component="span" />
                  </div>

                  <div className={`field field--field-last_name ${errors.field_last_name ? 'field--invalid' : ''}`}>
                    <label htmlFor="field_last_name_follow" aria-label="Last name (required)">Last name*</label>
                    <Field id="field_last_name_follow" type="text" name="field_last_name" autoComplete="family-name" />
                    <ErrorMessage name="field_last_name" component="span" />
                  </div>

                  <div className={`field field--email-address ${errors.email_address ? 'field--invalid' : ''}`}>
                    <label htmlFor="email_address_follow" aria-label="Email address (required)">Email address*</label>
                    <Field id="email_address_follow" type="email" name="email_address" autoComplete="email" />
                    <ErrorMessage name="email_address" component="span" />
                  </div>

                  <div className={`field field--confirm-email_address ${errors.confirm_email_address ? 'field--invalid' : ''}`}>
                    <label htmlFor="confirm_email_address_follow" aria-label="Confirm email address (required)">Confirm address*</label>
                    <Field id="confirm_email_address_follow" type="email" name="confirm_email_address" />
                    <ErrorMessage name="confirm_email_address" component="span" />
                  </div>
                  
                  <div className={`field field--consent ${errors.field_i_would_like_to_follow_the ? 'field--invalid' : ''}`}>
                    <div className="field__inner-wrapper">
                      <Field id="consent_follow" type="checkbox" name="field_i_would_like_to_follow_the" />
                      <label htmlFor="consent_follow">
                        I would like to be notified when any new blog posts are published and I can confirm that I have read the <Link to="/privacy-notice">privacy policy</Link>.*
                      </label>
                    </div>
                    <ErrorMessage name="field_i_would_like_to_follow_the" component="span" />
                  </div>
                </fieldset>

                <ReCAPTCHA
                  sitekey={process.env.RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptcha}
                  className="field--recaptcha"
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
          successTitle="Thank you for following."
          successMessage="Thank you for following the Human Tissue Authority blog."
          buttonText="Close"
          buttonAria="Close modal window"
          buttonAction={() => window.location.reload()}
        />,
        document.body
      )}
    </>
  )
})

export default FollowBlog
