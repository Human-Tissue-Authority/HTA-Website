import React, { useState, useEffect } from "react"
import { Link } from "gatsby"
import Button from "../misc/button"
import { truncateToNearestWord } from "../../utils/utils"
import dayjs from "dayjs"

const CardFoi = ({ title, body, date, sector, tags, summary, audience, attachment }) => {
  const [combinedTags, setCombinedTags] = useState([])

  useEffect(() => {
    let tempTagsArr = []

    if (sector && sector.length > 0) {
      tempTagsArr.concat(sector)
    }

    if (tags && tags.length > 0) {
      tempTagsArr.concat(tags);
    }

    setCombinedTags(tempTagsArr)
  }, [])
  
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
    <Link
      className="card card-foi is-gapless is-multiline"
      aria-label={title}
      to={process.env.API_ROOT + attachment}
    >
      <div>
        <p className="card-foi__date">
          {dayjs(date).format('D MMM, YYYY')}
        </p>

        <h2 className="card-foi__title">
          {title}
        </h2>
      </div>

      {renderText()}

      <div className="card-foi__footer">
        <div className="card-foi__button-custom-wrapper is-hidden-dekstop">
          {attachment && (
            <Button
              text="View PDF"
              showArrow
              fake
            />
          )}
        </div>
        <div className="card-foi__node-info">
          {audience.length > 0 && audience.map((item, i) => (
            <span key={i} className="card-foi__audience">{item}</span>
          ))}
        </div>
      </div>
  </Link>
  )
}

export default CardFoi
