import React from 'react'
import { animated, useSpring, useTransition, config } from 'react-spring'
import ConditionalWrapper from '../helpers/ConditionalWrapper'
import Tag from './tag'

const TagGroup = props => {
  const { tags, title, wide } = props

  const animationBlock = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 400
  })
  
  const animationTags = useTransition(tags, item => item.label, {
    unique: true,
    trail: 600 / tags.length,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 1000
  })

  return (
    <ConditionalWrapper
      condition={typeof document !== 'undefined'}
      wrapper={children => (
        <animated.div
          style={animationBlock}
          className="section tag-group columns"
        >
          {children}
        </animated.div>
      )}
      elseWrapper={children => (
        <div className="section tag-group columns">
          {children}
        </div>
      )}
    >
      <div className={`tag-group__inner-wrapper column ${wide ? 'is-9' : 'is-6'} is-offset-1`}>
        {title && (
          <h2 className="h section-title">
            {title}
          </h2>
        )}
        
        <ul>
          {typeof document !== 'undefined' ? animationTags.map(({ item, key, props }) => (
            <animated.li style={props} key={key}>
              <Tag data={item} />
            </animated.li>
          )) : tags.map(item => (
            <li key={item.label}>
              <Tag data={item} />
            </li>
          ))}
        </ul>
      </div>
    </ConditionalWrapper>
  )
}

export default TagGroup
