import React from 'react'
import { animated, useTransition, config } from "react-spring"

const TermsFilter = props => {
  const { terms, openState, filterVal, setMethod } = props

  const setFilterTerms = termName => {
    setMethod(prev => {
      if (prev.includes(termName)) return prev.filter(item => item !== termName)

      return [...prev, termName]
    })
  }

  const animatedTerms = useTransition(terms, term => term.id, {
    unique: true,
    trail: 300 / terms.length,
    config: config.stiff,
    from: { opacity: 0, transform: 'translateX(-10px)' },
    enter: openState ? { opacity: 1, transform: 'translateX(0)' } : { opacity: 0, transform: 'translateX(-10px)' }
  })

  return (
    <div className="terms-filter__filter-controls">
      {animatedTerms.map(({ item, key, props}) => item && (
        <animated.div
          key={key}
          style={props}
        >
          <button
            type="button"
            className={`tag ${filterVal.includes(item.name) ? 'tag--active': ''} tag--link`}
            onClick={() => setFilterTerms(item.name)}
          >
            {item.name}
          </button>
        </animated.div>
      ))}
    </div>
  )
}

export default TermsFilter
