import React from 'react'
import { animated } from 'react-spring'
import { Link } from 'gatsby'

const Crumb = props => {
  const { label, link, animation } = props

  if (!link && label) {
    return <animated.li style={animation} className="crumb crumb__last">{label}</animated.li>
  }

  return (
    <animated.li style={animation} className="crumb">
      <Link to={link}>{label}</Link>
    </animated.li>
  )
}

export default Crumb
