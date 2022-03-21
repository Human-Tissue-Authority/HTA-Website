import React, { useState } from 'react'
import { navigate } from 'gatsby'
import FocusTrap from 'focus-trap-react'
import { animated, useTransition, config } from 'react-spring'
import SearchIcon from "../../images/search.svg"

import { cleanString } from '../../utils/utils'
import { useHasMounted } from '../../utils/hooks'

const Search = props => {
  const { open, setOpenMethod } = props
  const [searchQuery, setSearchQuery] = useState('')

  const animation = useTransition(open, null, {
    config: config.gentle,
    from: { opacity: 0 },
    enter: {
      opacity: 1,
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

  const exitSearchTrap = e => {
    if (e.key === 'Tab') {
      setOpenMethod(false);
    }
  }

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted();	

  if (!hasMounted) {	
    return null	
  }

  return animation.map(({ item, key, props }) => item && (
    <animated.div
      className="search"
      style={props}
      key={key}
    >
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
        <div className="search__outer-wrapper">
          <div className="search__inner-wrapper">
            <h3 className="visuallyhidden">Search</h3>
            <form className="search__form" onSubmit={fireSearch}>
              <input
                aria-label="Search"
                ref={input => input && input.focus()}
                type="text"
                placeholder="Search the HTA"
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search__submit" onKeyDown={exitSearchTrap}>
                <img src={SearchIcon} alt="search" />
              </button>
            </form>
          </div>
        </div>
      </FocusTrap>
    </animated.div>
  ))
}

export default Search