import React from 'react'
import { Link } from 'gatsby'

import Button from '../misc/button'
import dayjs from 'dayjs'

const CardPublication = props => {
  const {
    date,
    type,
    title,
    link,
    image
  } = props

  return (
    <div className="card card-publication">
      {image && <img className="card-publication__image" src={image} alt="" />}
      <p className="card-publication__date">Updated on {dayjs(date).format('D MMM, YYYY')}</p>
      <h3 className="card-publication__title">
        {title}
      </h3>

      <Button
        text={`View ${type}`}
        ariaText={`View ${title}`}
        link={link || '/404/'}
        showArrow
      />
    </div>
  )
}

export default CardPublication
