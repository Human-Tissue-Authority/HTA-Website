import React from 'react'
import { animated, useSpring, useTransition, config } from 'react-spring'
import { contactDataAsLink } from '../../utils/utils'
import ConditionalWrapper from '../helpers/ConditionalWrapper'

const KeyInformation = props => {
  const { items, title, wide } = props

  const animationBlock = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 200
  })
  
  const animationItems = useTransition(items, item => item.label, {
    unique: true,
    trail: 600 / items.length,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 800
	})
	
  return (
    <ConditionalWrapper
      condition={typeof document !== 'undefined'}
      wrapper={children => (
        <animated.div
          style={animationBlock}
          className="section key-information columns"
        >
          {children}
        </animated.div>
      )}
      elseWrapper={children => (
        <div className="section key-information columns">
          {children}
        </div>
      )}
    >
      <div className={`key-information__inner-wrapper column ${wide ? 'is-9' : 'is-6'} is-offset-1`}>

        {title && (
          <h2 className="h section-title">
            {title}
          </h2>
        )}

        <ul className="columns is-multiline">
          {items.map(item => {
            if (item.value && item.value.length > 0) {
              let widthClass = 'is-12'

              if (wide && !item.wide) {
                widthClass = 'is-12 is-4-desktop'
              } else if (!wide && !item.wide) {
                widthClass = 'is-12 is-6-desktop'
              }

              return (
                <li className={`column ${widthClass}`} key={item.label}>
                  <p className="small-label">{item.label}</p>
                  {item.value instanceof Array ? item.value.map((value, i) => (
										item.type === 'contact' ? contactDataAsLink(value, item.value) : <p key={value} className="small-content">{value}</p>
                  )) : (
                    <p className="small-content">{item.value}</p>
                  )}
                </li>
              )
            }
          })}
        </ul>
      </div>
    </ConditionalWrapper>
  )
}

export default KeyInformation
