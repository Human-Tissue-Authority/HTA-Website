import React from "react"
import VisibilitySensor from "react-visibility-sensor"
import { animated, useSpring, config } from "react-spring"
import ConditionalWrapper from "../helpers/ConditionalWrapper"

const ParagraphWrapper = (props) => {
  const { classes, animationStyle, show, setShow, children, paragraphTitle } = props

  const animationTypes = {
    fadeIn: useSpring({
      config: config.gentle,
      from: { opacity: 0 },
      to: { opacity: show ? 1 : 0 },
    }),
    fadeInFromRight: useSpring({
      config: config.gentle,
      from: { opacity: 0, transform: 'translateX(10px)' },
      to: { opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(10px)' },
    }),
    fadeInFromLeft: useSpring({
      config: config.gentle,
      from: { opacity: 0, transform: 'translateX(-10px)' },
      to: { opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-10px)' },
    }),
    fadeInFromTop: useSpring({
      config: config.gentle,
      from: { opacity: 0, transform: 'translateY(-10px)' },
      to: { opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(-10px)' },
    }),
    fadeInFromBottom: useSpring({
      config: config.gentle,
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)' },
    })
  }
  const animation = animationStyle ? animationTypes[animationStyle] : animationTypes.fadeIn

  const checkVisibility = isVisible => {
    if (isVisible && !show) {
      setShow(true)
    }
  }

  return (
    <ConditionalWrapper
      condition={typeof document !== 'undefined'}
      wrapper={children => (
        <VisibilitySensor onChange={checkVisibility} minTopValue={100} partialVisibility>
          <animated.div
            style={animation}
            className={`paragraph ${classes || ''}`}
            id={paragraphTitle ? paragraphTitle.toLowerCase().split(' ').join('-') : false}
            data-title={paragraphTitle}
          >
            {children}
          </animated.div>
        </VisibilitySensor>
      )}
      elseWrapper={children => (
        <div
          className={`paragraph ${classes || ''}`}
          id={paragraphTitle ? paragraphTitle.toLowerCase().split(' ').join('-') : false}
          data-title={paragraphTitle}
        >
          {children}
        </div>
      )}
    >
      {children}
    </ConditionalWrapper>
  )
}

export default ParagraphWrapper
