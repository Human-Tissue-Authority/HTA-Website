import React from "react"
import { Link } from "gatsby"
import Button from "../misc/button"
import dayjs from "dayjs"
import { truncateToNearestWord } from "../../utils/utils"

const CardCurrentVacancy = ({ createdDate, title, link, closingDate, body, summary }) => {

  const renderText = () => {
    let textToRender

    if (summary) {
      textToRender = summary
    } else if (body) {
      textToRender = body
    }
    
    return (
      textToRender && <p className="card-current-vacancy__body">{truncateToNearestWord(textToRender, 250)}</p>
    )
  }

  return (
    <Link
      className="card card-current-vacancy"
      aria-label={title}
      to={link || "/404/"}
    >
      <p className="card-current-vacancy__date">
        {dayjs(createdDate).format("D MMM, YYYY")}
      </p>

      <h2 className="card-current-vacancy__title">
        {title}
      </h2>

      {renderText()}

      {closingDate && (
        <p className="card-current-vacancy__closing-date">
          <span>Closing date:</span>
          {dayjs(closingDate).format("h:MMa, D MMMM YYYY")}
        </p>
      )}
      <div className="card-current-vacancy__custom_button_wrapper"></div>
        <Button
          text="Read more"
          showArrow
          fake
        />
    </Link>
  )
}

export default CardCurrentVacancy
