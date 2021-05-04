import React from "react"
import { Link } from 'gatsby'
import InlineTags from "../content/inlineTags"
import Button from "../misc/button"
import { truncateToNearestWord } from "../../utils/utils"
import dayjs from "dayjs"

const CardFoi = ({ title, body, date, link, tags, summary, audience, attachment }) => {
  
  const renderText = () => {
    let textToRender

    if (summary) {
      textToRender = summary
    } else if (body) {
      textToRender = body[0] ? body[0].toString() : ''
    }

    return (
      textToRender && <p className="card-foi__body">{truncateToNearestWord(textToRender, 250)}</p>
    )
  }

  return (
    <div className={`card card-foi is-gapless is-multiline`}>

      <div>
        <p className="card-foi__date">
          {dayjs(date).format('D MMM, YYYY')}
        </p>

        <h3 className="card-foi__title">
          {title}
        </h3>
      </div>

      {renderText()}

      {tags && <InlineTags tags={tags} />}
      
      <div className="card-foi__footer">
        <div className="card-foi__button-custom-wrapper is-hidden-dekstop">
          {attachment && (
            <Button
              text={"View PDF"}
              ariaText={`View ${title}`}
              link={process.env.API_ROOT + attachment}
              showArrow
            />
          )}
        </div>
        <div className="card-foi__node-info">
          {audience.length > 0 && audience.map((item, i) => (
            <span key={i} className="card-foi__audience">{item}</span>
          ))}
        </div>
      </div>
  </div>
  )
}

export default CardFoi
