import React from 'react'
import { Link } from 'gatsby'
import Button from '../misc/button'
import dayjs from 'dayjs'

const CardPublication = props => {
  const {
    date,
    type,
    title,
    summary,
    link,
    image
  } = props

  return (
    <Link
      className="card card-publication"
      aria-label={title}
      to={link || '/404/'}
    >
      {image && <img className="card-publication__image" src={image} alt="" />}
      <p className="card-publication__date">Updated on {dayjs(date).format('D MMM, YYYY')}</p>
      <h2 className="card-publication__title">
        {title}
      </h2>

      {summary && (
        <p className="cms card-publication__summary">
          {summary}
        </p>
      )}

      <Button
        text={`View ${type}`}
        showArrow
        fake
      />
    </Link>
  )
}

export default CardPublication
