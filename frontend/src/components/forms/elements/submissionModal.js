import React from 'react'
import CrossWhite from '../../../images/cross-white.svg'
import { animated, useSpring, config } from 'react-spring'
import FocusTrap from 'focus-trap-react'
import Button from '../../misc/button'

const SubmissionModal = props => {
  const { successTitle, successMessage, buttonText, buttonAria, buttonAction } = props

  const animation = useSpring({
    config: config.gentle,
    from: { opacity: 0, transform: 'scale(1.05)' },
    to: { opacity: 1, transform: 'scale(1)' }
  })

  return (
      <animated.div
        className="submission-modal-overlay"
        style={animation}
      >
        <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
          <div className="submission-modal" role="dialog" tabIndex="-1" aria-labelledby="submission-modal__message">
            <div
              className="submission-modal__title"
              aria-live={!successMessage ? "polite" : null}
              role={!successMessage ? "status" : null}
            >
              <h2 className="h2">{successTitle || 'Form submission successful'}</h2>
            </div>

            {successMessage && (
              <div
                className="submission-modal__message"
                id="submission-modal__message"
                aria-live="polite"
                role="status"
              >
                <p>{successMessage}</p>
              </div>
            )}

            <div className="submission-modal__primary-button">
              <Button
                text={buttonText}
                ariaText={buttonAria}
                clickMethod={buttonAction}
                showArrow={false}
              />
            </div>

            <button type="button" className="submission-modal__close-button" onClick={buttonAction}>
              <img src={CrossWhite} alt="Close form submission modal popup" />
            </button>
          </div>
        </FocusTrap>
      </animated.div>
  )
}

export default SubmissionModal
