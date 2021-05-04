import React, { useState } from 'react'
import { Link } from 'gatsby'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { object, string, boolean } from 'yup'
import { encode } from 'js-base64'
import ReCAPTCHA from 'react-google-recaptcha';
 
import { verifyRecaptcha } from '../../utils/utils'

import SubmitButton from './elements/submitButton'

const AddComment = ({nid}) => {

    const SUBMISSION_ENDPOINT = `${process.env.API_ROOT}/comment`
    const COMMENT_NOTIFY_ENDPOINT = `${process.env.API_ROOT}/bbd_custom_rest_api/set-comment-notify-setting`
    
    const [recaptchaValue, setRecaptchaValue] = useState(null);
  
    // handle form submission
    const handleFormSubmission = async (values, actions) => {
      if (values.email_address === values.field_confirm_email_address) {
        const headers = new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        })

        const payload = {
          entity_id: [
              {
                  target_id: nid
              }
          ],
          subject: [
              {
                  value: "Comment title"
              }
          ],
          entity_type: [
              {
                  value: "node"
              }
          ],
          comment_type: [
              {
                  target_id: "blog"
              }
          ],
          field_name: [
              {
                  value: 'field_comment'
              }
          ],
          field_comment: [
              {
                  value: values.field_comment,
                  basic_html: "basic_html"
              }
          ],
          field_last_name: [
              {
                  value: values.first_name,
                  basic_html: "basic_html"
              }
          ],
          name: [
              {
                  value: values.field_confirm_email_address
              }
          ],
          field_i_would_like_to_follow_the: [
            {
              value: values.field_i_would_like_to_follow_the_post
            }
          ],
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
  
        const recaptchaResponse = await verifyRecaptcha(recaptchaValue)

        if (recaptchaResponse.success) {
          try {
            const response = await fetch(SUBMISSION_ENDPOINT, options)
            
            if (response.ok) {
              // submission successful
              const data = await response.json()

              if (values.field_i_would_like_to_follow_the_comments) {
                const notifyResponse = await setCommentNotification(headers, data.cid[0].value)
              }

              if (typeof data.error !== 'undefined') {
                // Error returned from Drupal while trying to process the request.
                actions.setStatus({
                  error: true,
                  message: data.error.message,
                })
              } else {
                actions.setStatus({
                  success: true,
                  message: 'Thanks. We will get back to you shortly.',
                })

                 // subscribe user to the HTA blog if checkbox is checked
                if (payload.field_i_would_like_to_follow_the[0].value) {
                  const followBlogPayload = {
                    first_name: values.first_name,
                    last_name: values.field_last_name,
                    email_address: values.email_address,
                    blog: nid,
                    submitted_to: nid,
                    i_would_like_to_be_notified_when_any_new_blog_posts_are_added_an: true,
                    webform_id: 'follow_the_hta_blog'
                  }

                  const followBlogOptions = {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(followBlogPayload)
                  }
                  
                  fetch(`${process.env.API_ROOT}/webform_rest/submit?_format=json`, followBlogOptions)
                }
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

    const setCommentNotification = async (headers, commentId) => {
      const payload = {
        comment_id: commentId,
        comment_notify: 1
      }

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }

      try {
        return await fetch(COMMENT_NOTIFY_ENDPOINT, options)

      } catch (e) {
        console.log(e)
      }
    }
  
    const handleRecaptcha = value => {
      setRecaptchaValue(value);
    }
  
    return (
        <div className="add-comment__wrapper">
          <div className="columns">
            <div className="column is-10 is-offset-1" >
              <div className="h add-comment__title">
                  Add new comment
              </div>
      
              <Formik
                  initialValues={{
                    first_name: '',
                    field_last_name: '',
                    email_address: '',
                    field_confirm_email_address: '',
                    field_comment: '',
                    field_i_would_like_to_follow_the_post: false,
                    field_i_would_like_to_follow_the_comments: false
                  }}
                  validationSchema={object({
                    first_name: string().required('Please provide a first name'),
                    field_last_name: string().required('Please provide a last name'),
                    email_address: string().email('Invalid email address').required('Please confirm your email address'),
                    field_confirm_email_address: string().email('Invalid email address').required('Please enter your email address'),
                    field_comment: string().required('Please enter your comment'),
                    field_i_would_like_to_follow_the_post: boolean(),
                    field_i_would_like_to_follow_the_comments: boolean(),
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
                      <legend>
                        <span className="accessibility">Add comment: your details</span>
                      </legend>
      
                      <div className="columns">
                        <div className={`field field--add-comment column is-6 field--first_name ${errors.first_name ? 'field--invalid' : ''}`}>
                          <label htmlFor="first_name" aria-label="First name (required)">First name*</label>
                          <Field id="first_name" type="text" name="first_name" autoComplete="given-name" />
                          <ErrorMessage name="first_name" component="span" />
                        </div>

                        <div className={`field field--add-comment column is-6 field--field_last_name ${errors.field_last_name ? 'field--invalid' : ''}`}>
                          <label htmlFor="field_last_name" aria-label="Last name (required)">Last name*</label>
                          <Field id="field_last_name" type="text" name="field_last_name" autoComplete="family-name" />
                          <ErrorMessage name="field_last_name" component="span" />
                        </div>
                      </div>

                      <div className="columns">
                        <div className={`field field--add-comment column is-6 field--field_confirm_email_address ${errors.field_confirm_email_address ? 'field--invalid' : ''}`}>
                          <label htmlFor="field_confirm_email_address" aria-label="Email address (required)">Email address*</label>
                          <Field id="field_confirm_email_address" type="email" name="field_confirm_email_address" autoComplete="email" />
                          <ErrorMessage name="field_confirm_email_address" component="span" />
                        </div>

                        <div className={`field field--add-comment column is-6 field--email_address ${errors.email_address ? 'field--invalid' : ''}`}>
                          <label htmlFor="email_address" aria-label="Confirm email address (required)">Confirm email address*</label>
                          <Field id="email_address" type="email" name="email_address" />
                          <ErrorMessage name="email_address" component="span" />
                        </div>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend>
                        <span className="accessibility">Add comment: comment details</span>
                      </legend>
      
                      <div className={`field field--field_comment ${errors.field_comment ? 'field--invalid' : ''}`}>
                        <label htmlFor="field_comment" aria-label="Comment (required)">Comment*</label>
                        <Field id="field_comment" name="field_comment" as="textarea"/>
                        <ErrorMessage name="field_comment" component="span" />
                      </div>
                        
                      <div className={`field field--add-comment field--consent  ${errors.field_i_would_like_to_follow_the_post ? 'field--invalid' : ''}`}>
                        <div className="field__inner-wrapper">
                          <Field id="field_i_would_like_to_follow_the_post" type="checkbox" name="field_i_would_like_to_follow_the_post"/>
                          <label htmlFor="field_i_would_like_to_follow_the_post">
                            I would like to follow the Human Tissue Authority blog to receive a notification for all new blog posts
                          </label>
                        </div>
                        <ErrorMessage name="field_i_would_like_to_follow_the_post" component="span" />
                      </div>

                      <div className={`field field--add-comment field--consent ${errors.field_i_would_like_to_follow_the_comments ? 'field--invalid' : ''}`}>
                        <div className="field__inner-wrapper">
                          <Field id="field_i_would_like_to_follow_the_comments" type="checkbox" name="field_i_would_like_to_follow_the_comments"/>
                          <label htmlFor="field_i_would_like_to_follow_the_comments">
                            I would like to follow this blog post and receive an update on any other comments added
                          </label>
                        </div>
                        <ErrorMessage name="field_i_would_like_to_follow_the_comments" component="span" />
                      </div>

                      <div className={`field field--add-comment field--consent field--privacy-policy ${errors.privacy_policy ? 'field--invalid' : ''}`}>
                        <div className="field__inner-wrapper">
                          <p>
                            Please view our <Link to="/privacy-notice">privacy policy</Link> regarding sharing of personal information.
                          </p>
                        </div>
                      </div>
                    </fieldset>

                    <div className="columns">
                      <div className="column is-6">
                        <p>CAPTCHA - This question is for testing whether or not you are a human visitor and to prevent automated spam submissions.</p>
                      </div>
                      <div className="column is-6">
                        <ReCAPTCHA
                          sitekey={process.env.RECAPTCHA_SITE_KEY}
                          onChange={handleRecaptcha}
                          className="field--recaptcha"
                        />
                      </div>
                    </div>
      
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
          </div>
        </div>
    )
}

export default AddComment
