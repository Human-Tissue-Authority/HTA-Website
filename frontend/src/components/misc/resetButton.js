import React from 'react'
import CircleArrowPurple from '../../images/circle-arrow--purple.svg'

const ResetButton = props => {
  const { clickMethod, text, icon } = props

  return (
    <button type="button" className="reset-button" onClick={clickMethod} aria-label={text || 'Reset filters'}>
      {icon && (
        <img src={CircleArrowPurple} role="presentation" aria-hidden alt="" />
      )}
      <span>{text || 'Reset filters'}</span>
    </button>
  )
}

export default ResetButton
