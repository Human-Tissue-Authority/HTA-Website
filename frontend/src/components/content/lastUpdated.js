import React from 'react'
import { animated, useSpring, config } from 'react-spring'

const LastUpdated = props => {
  const { timestamp, wide, published } = props

  const animation = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 300,
  })

  return (
    <>
      {typeof document !== 'undefined' ? (
        <animated.div
          style={animation}
          className="last-updated columns"
        >
          <p className={`column ${wide ? 'is--9' : 'is-6'} is-offset-1`}>
            {published ? 'Published' : 'Last updated'} on {timestamp}
          </p>
        </animated.div>
      ) : (
        <div className="last-updated columns">
          <p className={`column ${wide ? 'is--9' : 'is-6'} is-offset-1`}>
            {published ? 'Published' : 'Last updated'} on {timestamp}
          </p>
        </div>
      )}
    </>
  )
}

export default LastUpdated
