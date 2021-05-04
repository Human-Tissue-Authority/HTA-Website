import React from 'react'
import { animated, useTransition, config } from 'react-spring'

const InlineTags = props => {
  const { tags, classes } = props

  const animationTags = useTransition(tags, item => item, {
    unique: true,
    trail: 600 / tags.length,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 1000
  })

  return (
    <ul className={`inline-tags ${classes || ''}`}>
      {animationTags.map(({ item, key, props }) => item ? (
        <animated.li key={key} className="tag">{item}.</animated.li>
      ) : (
        null
      ))}
    </ul>
  )
}

export default InlineTags
