import React, { useState } from 'react'
import { Link } from 'gatsby'
import { animated, useTransition, config } from 'react-spring'

import ArrowWhite from '../../images/arrow-white.svg'
import ArrowPurple from '../../images/arrow-purple.svg'

const Button = props => {
  const { text, ariaText, link, showArrow, clickMethod, fake } = props
  const [active, setActive] = useState(false)

  const animation = useTransition(active, null, {
    from: { opacity: 0 },
    config: config.stiff,
    unique: true,
    enter: { opacity: 1, position: 'static' },
    leave: { opacity: 0, position: 'absolute' },
  })

  if (fake) {
    return (
      <div className="button-wrapper">
        <div
          className="button button--fake"
          onMouseDown={() => setActive(true)}
          onMouseUp={() => setActive(false)}
          onMouseLeave={() => setActive(false)}
        >
          {typeof document !== 'undefined' ? animation.map(({ item, key, props }) => showArrow && item ?
            <animated.img key={key} style={props} src={ArrowWhite} aria-hidden role="presentation" alt="" /> :
            <animated.img key={key} style={props} src={ArrowPurple} aria-hidden role="presentation" alt="" />
          ) : (
            <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
          )}
          {text}
        </div>
      </div>
    )
  }
  
  if (link) {
    return (
      <div className="button-wrapper">
        <Link
          to={link}
          aria-label={ariaText || text}
          className="button"
          onMouseDown={() => setActive(true)}
          onMouseUp={() => setActive(false)}
          onMouseLeave={() => setActive(false)}
        >
          {typeof document !== 'undefined' ? animation.map(({ item, key, props }) => showArrow && item ?
            <animated.img key={key} style={props} src={ArrowWhite} aria-hidden role="presentation" alt="" /> :
            <animated.img key={key} style={props} src={ArrowPurple} aria-hidden role="presentation" alt="" />
            ) : (
            <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
          )}
          {text}
        </Link>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="button"
      aria-label={ariaText || text}
      onClick={() => clickMethod()}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
    >
      {typeof document !== 'undefined' ? showArrow && animation.map(({ item, key, props }) => showArrow && item ?
        <animated.img key={key} style={props} src={ArrowWhite} aria-hidden role="presentation" alt="" /> :
        <animated.img key={key} style={props} src={ArrowPurple} aria-hidden role="presentation" alt="" />
      ) : (
        <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
      )}
      {text}
    </button>
  )
}

export default Button
