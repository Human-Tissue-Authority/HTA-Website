import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

import ArrowPurple from '../../../images/arrow-purple.svg'
import CrossWhite from '../../../images/cross-white.svg'
import CheckmarkWhite from '../../../images/checkmark-white.svg'
import AnimatedLoaderIcon from '../../misc/animatedLoaderIcon'

const SubmitButton = props => {
  const { text, showArrow, status, isSubmitting, isValidating, errors } = props

   const [index, setIndex] = useState(0)
   const [defaultWidth, setDefaultWidth] = useState('auto')
   
   const buttonRef = useRef(null)

   useEffect(() => {
    if (buttonRef) {
      setDefaultWidth(buttonRef.current.clientWidth + 10)
    }
   }, [buttonRef])

  useEffect(() => {
    if (isSubmitting && !isValidating) {
      // form submitting
      setIndex(3)
    } else if ((status && status.error) || (errors && Object.keys(errors).length > 0)) {
      // submission error
      setIndex(2)
      // reset to default state
      setTimeout(() => {
        setIndex(0)
      }, 2000)
    } else if (status && status.success) {
      // submission successful
      setIndex(1)
    } else {
      // default state
      setIndex(0)
    }
  }, [status, isSubmitting, isValidating, errors])

  const renderState = () => {
    switch(index) {
      case 1: {
        return <img src={CheckmarkWhite} alt="submission successful! Thank you" />
      }
      case 2: {
        return <img src={CrossWhite} alt="submission failed due to error" />
      }
      case 3: {
        return <AnimatedLoaderIcon colorOverride="#4E1965" />
      }
      default: {
        return (
          <>
            {showArrow && <img src={ArrowPurple} alt="submit form" />}
            {text}
          </>
        )
      }
    }
  }

  const stateClasses = ['', 'field--submit--success', 'field--submit--error', 'field--submit--sending']

  return (
    <div className="form-submit-wrapper">
      <button ref={buttonRef} type="submit" style={{ width: index === 1 ? '47px' : defaultWidth }} className={`field field--submit ${stateClasses[index]}`} disabled={index !== 0}>
        <SwitchTransition>
          <CSSTransition
            key={index}
            addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
            classNames="fade"
          >
            {renderState()}
          </CSSTransition>
        </SwitchTransition>
      </button>
    </div>
  )
}

export default SubmitButton
