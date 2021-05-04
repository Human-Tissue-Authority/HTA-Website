import React from 'react'
import { animated, useTransition, config } from "react-spring"

const AlphabetFilter = props => {
  const { openState, filterVal, setMethod } = props

  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  const setAlphabetFilterLetters = letter => {
    setMethod(prev => {
      if (prev.includes(letter)) return prev.filter(item => item !== letter)

      return [...prev, letter]
    })
  }

  const animatedLetters = useTransition(alphabet, letter => letter, {
    unique: true,
    trail: 300 / alphabet.length,
    config: config.stiff,
    from: { opacity: 0, transform: 'translateX(-10px)' },
    enter: openState ? { opacity: 1, transform: 'translateX(0)' } : { opacity: 0, transform: 'translateX(-10px)' }
  })

  return (
    <div className="alphabet-filter__filter-controls">
      {animatedLetters.map(({ item, key, props}) => item && (
        <animated.div
          key={key}
          style={props}
        >
          <button
            type="button"
            className={`tag ${filterVal.includes(item) ? 'tag--active': ''} tag--link`}
            onClick={() => setAlphabetFilterLetters(item)}
          >
            {item}
          </button>
        </animated.div>
      ))}
    </div>
  )
}

export default AlphabetFilter
