import React, { useState } from 'react'
import { animated, useTransition, config } from 'react-spring'

import ArrowPurple from '../../images/arrow-purple.svg'
import ArrowWhite from '../../images/arrow-white.svg'

const ButtonThin = props => {
  const { text, link, ariaLabelText } = props
  const [active, setActive] = useState(false)

  const animation = useTransition(active, null, {
    from: { position: 'absolute', opacity: 0 },
    config: config.stiff,
    unique: true,
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return (
    <div className="button-thin">
      <a href={link} ariaLabel={ariaLabelText} target="_blank" onMouseDown={() => setActive(true)} onMouseLeave={() => setActive(false)}>
        <p>{text}</p>
  
        <div className="button-thin__icon">
          {typeof document !== 'undefined' ? animation.map(({ item, key, props }) => item ?
            <animated.img key={key} style={props} src={ArrowWhite} role="presentation" alt="" /> :
            <animated.img key={key} style={props} src={ArrowPurple} role="presentation" alt="" />
          ) : (
            <img src={ArrowPurple} role="presentation" alt="" />
          )}
        </div>
      </a>
    </div>
  )
}

export default ButtonThin
