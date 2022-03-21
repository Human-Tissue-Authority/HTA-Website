import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import Button from '../misc/button'
import { truncateToNearestWord } from '../../utils/utils'
import dayjs from 'dayjs'

import StarPurple from '../../images/star.svg'

const CardSearch = props => {
  const {
    lastUpdated,
    title,
    link,
    fileLink,
    body,
    summary,
    audience,
    contentType,
    newsType,
    featured,
    isFullWidth,
    fullWidthClass
  } = props

  const [text, setText] = useState(summary)
  const [type, setType] = useState(null)

  useEffect(() => {
    switch (contentType) {
      case 'establishment': 
        setText('Establishment page with licensing information and inspection reports')
        setType('Establishment')
        break
      case ('medical_school' || 'medical school'):
        setText('Medical School page with contact details and information on which geographical areas are covered')
        setType('Medical School')
        break
      case 'article':
        if (newsType) {
          setType(newsType)
        } else {
          setType('News or event')
        }

        if (summary) {
          setText(summary)
        } else if (body) {
          setText(body.join(' '))
        }

        break
      default:
        if (summary) {
          setText(summary)
        } else if (body) {
          setText(body.join(' '))
        }

        setType(contentType)
    }
  }, [])

  const determineLink = () => {
    if (type === 'foi' && fileLink) {
      return fileLink?.length > 0 ? process.env.API_ROOT + fileLink[0] : '404'
    }

    return link || '/404'
  }

  return (
    <Link
      className={`card card-search ${isFullWidth ? fullWidthClass : ''}`}
      to={determineLink()}
      aria-label={title}
    >
      <p className="card-search__last-updated">
        <span>Updated on&nbsp;</span>
        {dayjs(lastUpdated).format('D MMM, YYYY')}
        {featured && <span><img src={StarPurple} role="presentation" aria-hidden alt="" /></span>}
      </p>

      <div className="card-search__title-wrapper">
        <h2 className="card-search__title">
          {title}
        </h2>

        {isFullWidth && (
          <div className="button-mobile-wrapper">
            <Button
              text={"View page"}
              showArrow
              fake
            />
          </div>
        )}
      </div>

      {text && <p className="card-search__body">{truncateToNearestWord(text, 160)}</p>}

      <div className="card-search__footer">
        <Button
          text={type === 'foi' && fileLink && fileLink.length ? 'View PDF' : 'View page'}
          showArrow
          fake
        />

        <div className="card-search__node-info">
          {audience && <p className="card-search__audience">{audience[0]}</p>}
          {type && <p className="card-search__type">{type}</p>}
        </div>
      </div>
    </Link>
  )
}

export default CardSearch
