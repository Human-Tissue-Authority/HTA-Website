import React from 'react'
import { animated, useSpring, config } from 'react-spring'

const Title = props => {
  const { title, wide } = props

  const animation = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay:  400,
  })

  return (
    <animated.div
      style={animation}
      className="title page__title columns"
    >
      <h1 className={`${wide ? 'is-9' : 'is-6'} column is-offset-1`}>
        {title}
      </h1>
    </animated.div>
  )
}

export default Title
