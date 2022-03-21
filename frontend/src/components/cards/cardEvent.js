import React from "react"
import { Link } from "gatsby"
import Button from "../misc/button"
import { truncateToNearestWord } from "../../utils/utils"
import dayjs from "dayjs"

const CardEvent = ({ title, body, venue, date, contact, link, summary }) => {
  const timeFormatted = dayjs(date).format('h:mm a')
  const dateFormatted = dayjs(date).format('D MMM YYYY')

  const renderText = () => {
    let textToRender

    if (summary) {
      textToRender = summary
    } else if (body && body[0]) {
      textToRender = body[0].toString()
    }

    return (
      textToRender && <p className="card-event__body">{truncateToNearestWord(textToRender, 250)}</p>
    )
  }

  return (
    <Link
      className="card card-event"
      aria-label={title}
      to={link || '/404'}
    >
      <div className="columns">
        <div className="column is-6">
          <h2 className="card-event__title">{title}</h2>
          <div className="card-event__is-hidden-mobile">
           <Button text='Read more' showArrow fake />
          </div>
        </div>
        <div className="column is-6">
          {renderText()}
          <div className="columns">
            <div className="column is-half">
              <div className='card-event__label'>
                Venue
              </div>
              <div className="card-event__info">
                {venue}
              </div>
            </div>
            <div className="column is-half">
              <div className='card-event__label'>
                Date
              </div>
              <div className="card-event__info">
                {dateFormatted}
              </div>
            </div>
          </div>
          <div className="columns is-multiline">
            <div className="column is-half">
              <div className='card-event__label'>
                Time
              </div>
              <div className="card-event__info">
                {timeFormatted}
              </div>
            </div>
            <div className="column is-full is-half-widescreen">
              <div className='card-event__label'>
                Contact
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CardEvent
