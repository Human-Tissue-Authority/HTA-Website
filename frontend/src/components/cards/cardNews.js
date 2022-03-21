import React from 'react'
import { Link } from 'gatsby'
import Button from '../misc/button'
import { truncateToNearestWord } from '../../utils/utils'
import dayjs from 'dayjs'

const CardNews = props => {
  const { body, index, summary } = props
  const isFirstItem = index === 0

  const renderText = () => {
    let textToRender

    if (summary) {
      textToRender = summary
    } else if (body) {
      textToRender = body.join(' ').toString()
    }

    return (
      textToRender && <p className="card-news__body">{truncateToNearestWord(textToRender, 250)}</p>
    )
  }

  if (isFirstItem) {
    return (
      <CardFullWidth {...props} renderText={renderText} />
    )
  } else {
    return (
      <Card {...props} renderText={renderText} />
    )
  }
}

const Card = ({ date, title, link, audience, renderText }) => {
  return (
    <Link
      className={`card card-news is-gapless is-multiline`}
      aria-label={title}
      to={link || '/404'}
    >
      <div className=''>
        <p className="card-news__date">
          {dayjs(date).format('D MMM, YYYY')}
        </p>

        <h2 className="card-news__title">
          {title}
        </h2>
      </div>

      {renderText()}

      <div className="card-news__footer">
        <div className="card-news__button-custom-wrapper is-hidden-dekstop">
          <Button
            text={"Find out more"}
            showArrow
            fake
          />
        </div>
        <div className="card-news__node-info">
          {audience.length > 0 && audience.map((item, i) => (
            <span key={i} className="card-news__audience">{item}</span>
          ))}
        </div>
      </div>
  </Link>
  )
}

const CardFullWidth = ({ date, title, link, audience, renderText }) => {
  return (
    <Link
      className="card card-news big columns is-gapless is-multiline"
      aria-label={title}
      to={link || '/404'}
    >
      <div className='column is-half is-full-mobile'>
        <p className="card-news__date">
          {dayjs(date).format('D MMM, YYYY')}
        </p>

        <Link className="card-news__title" to={link || '/404'}>
          {title}
        </Link>
        <div className="card-news__button-custom-wrapper is-hidden-mobile">
            <Button
              text={"Find out more"}
              showArrow
              fake
            />
          </div>
      </div>
      <div className={`column is-half is-full-mobile card-news__col`}>

        {renderText()}

        <div className="card-news__footer">
          <div className="card-news__button-custom-wrapper is-hidden-desktop">
            <Button
              text={"Find out more"}
              showArrow
              fake
            />
          </div>
          <div className="card-news__node-info">
            {audience.length > 0 && audience.map((item, i) => (
              <span key={i} className="card-news__audience">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CardNews