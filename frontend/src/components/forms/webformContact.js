import React, { useState, useEffect } from 'react'
import { createPortal } from "react-dom"
import { navigate } from 'gatsby'
import queryString from 'query-string'
import { window } from 'browser-monads'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { object, string } from 'yup'
import { encode } from 'js-base64'
import ReCAPTCHA from 'react-google-recaptcha';

import SubmitButton from './elements/submitButton'
import { parseContent, verifyRecaptcha } from '../../utils/utils'
import SubmissionModal from './elements/submissionModal'

const WebformContact = props => {
  const { title, body } = props
  const [contactAs, setContactAs] = useState('Professional')
  const [recaptchaValue, setRecaptchaValue] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // redirect from establishment Contact Us button
  const [establishmentNID, setEstablishmntNID] = useState(null)
  const [natureOfEnquiry, setNatureOfEnquiry] = useState(null)

  useEffect(() => {
    const url = window.location.href
    const urlParams = queryString.parseUrl(url)

    if (urlParams.query.establishment) {
      setEstablishmntNID(urlParams.query.establishment)
      setNatureOfEnquiry('Enquiry about an establishment')
    } else {
      setNatureOfEnquiry('General enquiry')
    }
  }, [])

  // handle form submission
  const handleFormSubmission = async (values, actions) => {
    const SUBMISSION_ENDPOINT = `${process.env.API_ROOT}/webform_rest/submit?_format=json`
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    })

    let payload

    if (contactAs === 'Professional') {
      payload = {
        webform_id: 'contact',
        i_wish_to_contact_the_hta_in_my_capacity_as_a: contactAs,
        name: values.name,
        email: values.email,
        your_organisation: values.your_organisation,
        your_department: values.your_department,
        nature_of_your_enquiry: values.nature_of_your_enquiry,
        establishment: establishmentNID,
        message: values.message
      }
    } else {
      payload = {
        webform_id: 'contact',
        i_wish_to_contact_the_hta_in_my_capacity_as_a: contactAs,
        name: values.name,
        email: values.email,
        your_organisation: '',
        your_department: '',
        nature_of_your_enquiry: values.nature_of_your_enquiry,
        establishment: establishmentNID,
        message: values.message
      }
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
  
      actions.setSubmitting(false)
    } else {
      actions.setSubmitting(false)
      actions.setStatus({
        error: true,
        message: 'reCAPTCHA verification failed. Please try again.',
      })
    }
  }

  const handleRecaptcha = value => {
    setRecaptchaValue(value);
  }

  return (
    <div className="webform webform-contact columns">
      <div className="webform-contact__wrapper column is-6 is-offset-1">
        {title && (
          <h2 className="h webform__title section-title">{title}</h2>
        )}

        {body && (
          <div className="webform__body" dangerouslySetInnerHTML={{ __html: parseContent(body.processed) }} />
        )}

        <div className="webform__form-wrapper">
          {natureOfEnquiry && (
            <Formik
              initialValues={{
                name: '',
                email: '',
                your_organisation: '',
                your_department: '',
                nature_of_your_enquiry: natureOfEnquiry,
                message: ''
              }}
              validationSchema={object({
                name: string().required('Please enter your name'),
                email: string().email('Invalid email address').required('Please enter your email address'),
                your_organisation: string(),
                your_department: string(),
                nature_of_your_enquiry: string().required('Please enter the nature of your enquiry'),
                message: string().required('Please enter your enquiry details'),
              })}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={(values, actions) => {
                handleFormSubmission(values, actions)
              }}
            >
              {({ isSubmitting, isValidating, status, errors }) => (
                <Form>
                  {errors && Object.keys(errors).length > 0 && (
                    <div className="form-error" aria-live="polite" role="alert">
                      Please fill in all fields
                    </div>
                  )}

                  <fieldset>
                    <legend>
                      <span className="accessibility">Contact us: your information</span>
                    </legend>

                    <div className="field field--contact-as">
                      <label>I wish to contact the HTA in my capacity as a...</label>
                      <button
                        type="button"
                        className={`webform-contact__contact-as-button ${contactAs === 'Professional' ? 'webform-contact__contact-as-button--active': ''}`}
                        onClick={() => setContactAs('Professional')}
                      >
                        Professional
                      </button>

                      <button
                        type="button"
                        className={`webform-contact__contact-as-button ${contactAs !== 'Professional' ? 'webform-contact__contact-as-button--active': ''}`}
                        onClick={() => setContactAs('Member of the public / other')}
                      >
                        Member of the public
                      </button>
                    </div>

                    <div className={`field field--name ${errors.name ? 'field--invalid' : ''}`}>
                      <label htmlFor="name" aria-label="Name (required)">Name*</label>
                      <Field id="name" type="text" name="name" autoComplete="name" />
                      <ErrorMessage name="name" component="span" />
                    </div>

                    <div className={`field field--email ${errors.email ? 'field--invalid' : ''}`}>
                      <label htmlFor="email" aria-label="Email address (required)">Email address*</label>
                      <Field id="email" type="email" name="email" autoComplete="email" />
                      <ErrorMessage name="email" component="span" />
                    </div>

                    {contactAs === 'Professional' && (
                      <>
                        <div className={`field field--your_organisation ${errors.your_organisation ? 'field--invalid' : ''}`}>
                          <label htmlFor="your_organisation">Organisation</label>
                          <Field id="your_organisation" type="text" name="your_organisation" autoComplete="organization" />
                          <ErrorMessage name="your_organisation" component="span" />
                        </div>

                        <div className={`field field--your_department ${errors.your_department ? 'field--invalid' : ''}`}>
                          <label htmlFor="your_department">Department</label>
                          <Field id="your_department" type="text" name="your_department" />
                          <ErrorMessage name="your_department" component="span" />
                        </div>
                      </>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend>
                      <span className="accessibility">Contact us: message details</span>
                    </legend>

                    <div className={`field field--nature_of_your_enquiry ${errors.nature_of_your_enquiry ? 'field--invalid' : ''}`}>
                      <label htmlFor="nature_of_your_enquiry" aria-label="Nature of enquiry (required)">Nature of enquiry*</label>
                      <Field as="select" name="nature_of_your_enquiry" id="nature_of_your_enquiry">
                        <option value="General enquiry">General enquiry</option>
                        <option value="Body donation enquiry">Body donation enquiry</option>
                        <option value="Make a change to my licence">Make a change to my licence</option>
                        <option value="Enquiry about an establishment">Enquiry about an establishment</option>
                        <option value="Submit a FOI or DPA request">Submit a FOI or DPA request</option>
                        <option value="Media or website enquiry">Media or website enquiry</option>
                        <option value="Transplant Team enquiry">Transplant Team enquiry</option>
                        <option value="HTA careers">HTA careers</option>
                      </Field>
                      <div className="select-arrow" />
                      <ErrorMessage name="nature_of_your_enquiry" component="span" />
                    </div>

                    <div className={`field field--message ${errors.message ? 'field--invalid' : ''}`}>
                      <label htmlFor="message" aria-label="Enquiry details (required)">Enquiry details*</label>
                      <Field id="message" as="textarea" name="message" />
                      <ErrorMessage name="message" component="span" />
                    </div>
                  </fieldset>

                  <ReCAPTCHA
                    sitekey={process.env.RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptcha}
                    className="field--recaptcha"
                  />

                  <SubmitButton
                    text="Send"
                    isSubmitting={isSubmitting}
                    isValidating={isValidating}
                    status={status}
                    errors={errors}
                    showArrow
                  />
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>

      {/* Submission Successful Modal Portal */}
      {showModal && createPortal(
        <SubmissionModal
          successTitle="Enquiry sent."
          successMessage="Your enquiry has been sent and will be processed shortly. Thank you for contacting the Human Tissue Authority."
          buttonText="Okay"
          buttonAria="Close modal window"
          buttonAction={() => window.location.reload()}
        />,
        document.body
      )}
    </div>
  )
}

export default WebformContact
