import React, { useState, useRef, useEffect } from 'react'
import { navigate } from 'gatsby'
import FocusTrap from 'focus-trap-react'
import { animated, useTransition, config } from 'react-spring'

import CrossPurple from '../../images/cross-purple.svg'
import { cleanString } from '../../utils/utils'
import { useHasMounted } from '../../utils/hooks'

const Search = props => {
  const { open, setOpenMethod } = props
  const [searchQuery, setSearchQuery] = useState('')

  const getHeaderHeight = () => {
    const header = document.querySelector('.header')

    if (header) {
      return `${header.clientHeight}px`
    }

    return 'auto'
  }

  const animation = useTransition(open, null, {
    config: config.gentle,
    from: { opacity: 0 },
    enter: {
      opacity: 1,
      height: getHeaderHeight()
    },
    leave: { opacity: 0 }
  })

  const fireSearch = e => {
    e.preventDefault() 
    
    const keywords = cleanString(searchQuery)

    if (keywords && keywords.length > 0) {
      navigate(`/search?keywords=${keywords}`, { state: { keywords } })
    }
  }

  // shadow element for text input field, used to get width of text within input for enter icon offset
  const shadow = useRef({})
  const form = useRef({})
  const [offset, setOffset] = useState(149)

  useEffect(() => {
    if (shadow.current && form.current) {
      const textWidth = shadow.current.clientWidth
      const formWidth = form.current.clientWidth

      if (textWidth + 20 > formWidth - 55) {
        setOffset(formWidth - 55)
      } else {
        setOffset(textWidth + 20)
      }
    }
  }, [searchQuery, form])

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted();	

  if (!hasMounted) {	
    return null	
  }

  return animation.map(({ item, key, props }) => item && (
    <animated.div
      className="search"
      style={{ height: getHeaderHeight(), ...props }}
      key={key}
    >
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
        <div className="search__inner-wrapper">
          <h3 className="visuallyhidden">Search</h3>
          <form className="search__form" onSubmit={fireSearch} ref={form}>
            <input
              aria-label="Search"
              ref={input => input && input.focus()}
              type="text"
              placeholder="Search"
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" style={{ left: offset }} className="search__submit">
              Search
            </button>
          </form>
          <button
            onClick={() => setOpenMethod(false)}
            type="button"
            className="search__close-button"
            aria-label="close search"
          >
            <img src={CrossPurple} role="presentation" alt="" />
          </button>

          <span aria-hidden ref={shadow} className="search__input-shadow">
            {searchQuery || 'Search'}
          </span>
        </div>
      </FocusTrap>
    </animated.div>
  ))
}

export default Search