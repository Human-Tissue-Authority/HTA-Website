import React, { useState } from 'react'
import { animated, useSpring, config } from 'react-spring'
import { encode } from 'js-base64'

const STATUS = [
  'Unhelpful',
  'Not very helpful',
  'Fairly helpful',
  'Helpful',
  'Very helpful'
]

const RateThisPage = props => {
  const { page } = props

  const [rating, setRating] = useState(0)
  const [feedbackSent, setFeedbackSent] = useState(false)

  const animationSubmitButton = useSpring({
    config: config.gentle,
    from: { opacity: 0, transform: 'scale(0, 1)', position: 'absolute' },
    to: { opacity: rating > 0 ? 1 : 0, transform: rating > 0 ? 'scale(1, 1)' : 'scale(0, 1)', position: rating > 0 ? 'static' : 'absolute' }
  })

  const handleSendFeedback = e => {
    e.preventDefault()

    if (rating > 0) {
      setFeedbackSent(true)

      const SUBMISSION_ENDPOINT = `${process.env.API_ROOT}/webform_rest/submit?_format=json`
      const headers = new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      })

      const payload = {
        page,
        rating,
        webform_id: 'page_feedback'
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

      fetch(SUBMISSION_ENDPOINT, options)
    }
  }

  return (
    <div className={`rtp ${feedbackSent ? 'rtp--disabled' : ''}`} role="form">
      <div className="rtp__inner-wrapper">
        <h2 className="h h--3 rtp__title">How helpful was this page?</h2>
        <p className="rtp__help-text">Your feedback helps us improve the website and the information on it. Give this page a star rating by clicking in the stars below.</p>

        <form onChange={e => setRating(e.target.value)} onSubmit={handleSendFeedback}>
          <fieldset disabled={feedbackSent}>
            <legend><span className="accessibility">Rate this page</span></legend>

            <div id="rating">Rate this page</div>
            <div className="rtp__radio-group" role="group" aria-labelledby="rating" tabIndex="0">
              {[...Array(5)].map((e, i) => (
                <div key={i}>
                  <input
                    type="radio"
                    name="rating"
                    id={`rating__${i + 1}`}
                    value={i + 1}
                    className={`${i + 1 <= rating ? 'rtp__input--active' : ''}`}
                    onMouseEnter={() => setRating(i + 1)}
                    aria-label={`Rating: ${STATUS[i]}`}
                  />
                  <label htmlFor={`rating__${i + 1}`} className={`rtp__radio ${i + 1 <= rating ? 'rtp__radio--active' : ''}`}>
                    <svg width="30" height="28" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.0662 9.49898L19.1849 9.77396L19.4834 9.79905L29.2525 10.6204C29.5075 10.642 29.5692 10.9265 29.4104 11.061L29.4102 11.0612L22 17.3446L21.766 17.543L21.8369 17.8415L24.0574 27.1888C24.0822 27.2934 24.0434 27.3851 23.9567 27.4466C23.8691 27.5089 23.757 27.5212 23.6517 27.4588L23.6509 27.4583L15.2551 22.5027L15.001 22.3526L14.7468 22.5027L6.35154 27.458C6.35152 27.458 6.35149 27.458 6.35147 27.458C6.24499 27.5207 6.13225 27.5078 6.04478 27.4456C5.95819 27.384 5.91979 27.2928 5.94443 27.1891L5.94443 27.189L8.16502 17.8415L8.23593 17.543L8.00194 17.3446L0.590218 11.0597L0.589972 11.0594C0.430214 10.9242 0.492613 10.6405 0.747743 10.6189L10.517 9.79754L10.8154 9.77245L10.9341 9.4975L14.7501 0.659394L14.7503 0.658994C14.8416 0.447002 15.1588 0.447002 15.2501 0.658994L15.7093 0.461197L15.2503 0.659365L19.0662 9.49898Z" fill="#E7EAF4" stroke="#4E1965"/>
                    </svg>
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          
          <animated.div style={animationSubmitButton}>
            <button disabled={feedbackSent} type="submit" className="rtp__submit" tabIndex={rating > 0 ? '0' : '-1'}>
              {feedbackSent ? 'Feedback sent!' : 'Send feedback'}
            </button>
          </animated.div>
        </form>

        {rating > 0 && <p className="rtp__status">&quot;{STATUS[rating - 1]}&quot;</p>}
      </div>
    </div>
  )
}

export default RateThisPage
