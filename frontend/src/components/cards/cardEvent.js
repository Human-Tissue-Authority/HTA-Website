import React from "react"
import { Link } from 'gatsby'
import InlineTags from "../content/inlineTags"
import Button from "../misc/button"
import { contactDataAsLink, truncateToNearestWord } from "../../utils/utils"
import dayjs from "dayjs"

const CardEvent = ({ title, body, venue, date, contact, link, tags, summary }) => {
  const timeFormatted = dayjs(date).format('h:mm a')
  const dateFormatted = dayjs(date).format('D MMM YYYY')

  const renderText = () => {
    let textToRender

    if (summary) {
      textToRender = summary
    } else if (body) {
      textToRender = body[0].toString()
    }

    return (
      textToRender && <p className="card-event__body">{truncateToNearestWord(textToRender, 250)}</p>
    )
  }


  return (
    <div className="card-event">
      <div className="columns">
        <div className="column is-6">
          <h3 className="card-event__title">{title}</h3>
          {tags && <InlineTags tags={tags} classes={'card-event__tags'}/>}
          <div className="card-event__is-hidden-mobile">
           <Button ariaText={`View event: ${title}`} text='Read more' link={link} showArrow/>
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
              <div className="card-event__info">
                {contact.map((item, i) => contactDataAsLink(item, contact, i))}
              </div>
            </div>
          </div>
          <div className="card-event__is-visible-tablet card-event__button-mobile mt-2">
            <Button ariaText={`View event: ${title}`} text='Read more' link={link} classes={'is-hidden'} showArrow/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardEvent
