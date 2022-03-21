import React from 'react'
import { animated } from 'react-spring'
import { Link } from 'gatsby'
import ConditionalWrapper from '../helpers/ConditionalWrapper'

const Crumb = props => {
  const { label, link, animation } = props

  return (
    <ConditionalWrapper
      condition={animation}
      wrapper={children => (
        <animated.li style={animation} className={`crumb ${!link && 'crumb__last'}`}>{children}</animated.li>
      )}
      elseWrapper={children => (
        <li className={`crumb ${!link && 'crumb__last'}`}>{children}</li>
      )}
    >
      {link ? (
        <Link to={link}>{label}</Link>
      ) : (
        <>{label}</>
      )}
    </ConditionalWrapper>
  )
}

export default Crumb
