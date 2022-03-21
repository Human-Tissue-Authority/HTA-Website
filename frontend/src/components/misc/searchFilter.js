import React from 'react'
import SearchJet from '../../images/search--jet.svg'


const SearchFilter = props => {
  const { openState, filterVal, setMethod, setOpenMethod, tabTarget, ariaText, placeholder} = props

  // focus menu when tabbing backwards from parent link
  const handleTabOut = e => {
    const keyCode = e.keyCode || e.which;
  }

  return (
    <div
      className={`search-filter ${openState ?
        'search-filter--active' :
        ''
      }`}
    >
      <div>
        <input
          type="text"
          placeholder={placeholder || 'Search'}
          onChange={e => setMethod(e.target.value)}
          value={filterVal}
          aria-label={ariaText || 'Search'}
          onKeyDown={e => handleTabOut(e)}
        />

        <img src={SearchJet} role="presentation" aria-hidden alt="" />
      </div>
    </div>
  )
}

export default SearchFilter
