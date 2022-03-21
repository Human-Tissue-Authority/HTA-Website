import React from 'react'
import { Link } from 'gatsby'
import Button from '../../misc/button'

const PromotionalBlock = props => {
  const { title, summary, linkText, linkUrl} = props

  if (!linkUrl) {
    return null
  }

  return (
    <Link
      className="card promotional-block"
      aria-label={`${title}, ${linkText || 'find out more.'}`}
      to={linkUrl}
    >
      <h2>{title}</h2>
      <p>{summary}</p>
  
      <div className="promotional-block__button-wrapper">
        <Button
          text={linkText}
          showArrow
          fake
        />
      </div>
    </Link>
  )
}

export default PromotionalBlock
