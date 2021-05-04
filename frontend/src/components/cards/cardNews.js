import React from 'react'
import { Link } from 'gatsby'
import InlineTags from '../content/inlineTags'
import Button from '../misc/button'
import { truncateToNearestWord } from '../../utils/utils'
import dayjs from 'dayjs'

const CardNews = props => {
  const {tags, body, index, summary} = props
  const isFirstItem = index === 0
  const tagsList = tags[0].concat(tags[1])
  
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
      <CardFullWidth {...props} renderText={renderText} tagsList={tagsList}/>
    )
  } else {
    return (
      <Card {...props} renderText={renderText} tagsList={tagsList}/>
    )
  }
}

const Card = ({date, title, link, audience, renderText, tagsList}) => {
  return (
    <div className={`card card-news is-gapless is-multiline`}>
      <div className=''>
        <p className="card-news__date">
          {dayjs(date).format('D MMM, YYYY')}
        </p>

        <h3 className="card-news__title">
          {title}
        </h3>
      </div>

      {renderText()}

      {tagsList && <InlineTags tags={tagsList} />}

      <div className="card-news__footer">
        <div className="card-news__button-custom-wrapper is-hidden-dekstop">
          <Button
            text={"Find out more"}
            ariaText={`View ${title}`}
            link={link || '/404'}
            showArrow
          />
        </div>
        <div className="card-news__node-info">
          {audience.length > 0 && audience.map((item, i) => (
            <span key={i} className="card-news__audience">{item}</span>
          ))}
        </div>
      </div>
  </div>
  )
}

const CardFullWidth = ({date, title, link, audience, renderText, tagsList}) => {
  return (
    <div className='card card-news big columns is-gapless is-multiline'>
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
              ariaText={`View ${title}`}
              link={link || '/404'}
              showArrow
            />
          </div>
      </div>
      <div className={`column is-half is-full-mobile card-news__col`}>

        {renderText()}

        {tagsList && <InlineTags tags={tagsList} />}

        <div className="card-news__footer">
          <div className="card-news__button-custom-wrapper is-hidden-desktop">
            <Button
              text={"Find out more"}
              ariaText={`View ${title}`}
              link={link || '/404'}
              showArrow
            />
          </div>
          <div className="card-news__node-info">
            {audience.length > 0 && audience.map((item, i) => (
              <span key={i} className="card-news__audience">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardNews