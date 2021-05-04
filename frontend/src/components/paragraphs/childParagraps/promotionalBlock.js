import React from 'react'
import Button from '../../misc/button'

const PromotionalBlock = props => {
  const { title, summary, linkText, linkUrl} = props

  if (!linkUrl) {
    return null
  }

  return (
    <div className="promotional-block">
      <h3>{title}</h3>
      <p>{summary}</p>
  
      <div className="promotional-block__button-wrapper">
        <Button
          text={linkText}
          ariaText={`${title}, ${linkText || 'find out more.'}`}
          link={linkUrl}
          showArrow
        />
      </div>
    </div>
  )
}

export default PromotionalBlock
