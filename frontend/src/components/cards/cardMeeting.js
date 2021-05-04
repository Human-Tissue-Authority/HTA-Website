import React from 'react'
import { Link } from 'gatsby'

import Button from '../misc/button'
import dayjs from 'dayjs'

const CardMeeting = props => {
  const {
    title,
    link,
    timestamp,
    family
  } = props

  return (
    <div className="card card-meeting">
      <div className="card-meeting__title-wrapper">
        <h3 className="card-meeting__title">
          {title}
        </h3>

        <Button
          text={`Read more`}
          ariaText={`View ${title}`}
          link={link || '/404/'}
          showArrow
        />
      </div>

      <div className="card-meeting__info-wrapper">
        <p className="card-meeting__family">
          Family:&nbsp;
          {family.join(', ')}
        </p>

        <div className="card-meeting__info card-meeting__info--time">
          <p className="card-meeting__label">Time</p>
          <p className="card-meeting__timestamp">{dayjs(timestamp).format('hh:mm a')}</p>
        </div>

        <div className="card-meeting__info card-meeting__info--date">
          <p className="card-meeting__label">Date</p>
          <p className="card-meeting__timestamp">{dayjs(timestamp).format('D MMMM YYYY')}</p>
        </div>
      </div>
    </div>
  )
}

export default CardMeeting
