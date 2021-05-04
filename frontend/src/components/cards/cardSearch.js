import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'

import InlineTags from '../content/inlineTags'
import Button from '../misc/button'
import { truncateToNearestWord } from '../../utils/utils'
import dayjs from 'dayjs'

import StarPurple from '../../images/star.svg'

const CardSearch = props => {
  const {
    lastUpdated,
    title,
    link,
    body,
    tags,
    audience,
    contentType,
    newsType,
    featured,
    isFullWidth,
    fullWidthClass
  } = props

  const [text, setText] = useState(null)
  const [cardTags, setCardTags] = useState([])
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

        if (body) {
          setText(body.join(' '))
        }

        break
      default:
        if (body) {
          setText(body.join(' '))
        }

        setType(contentType)
    }

    // set card tags
    const cleanedTags = tags.filter(tag => tag)

    if (cleanedTags.length > 0) {
      // flatten multi-dimensional array
      const tagsArray = [].concat.apply([], cleanedTags)
      setCardTags(tagsArray)
    }
  }, [])

  return (
    <div className={`card card-search ${isFullWidth ? fullWidthClass : ''}`}>
      <p className="card-search__last-updated">
        <span>Updated on&nbsp;</span>
        {dayjs(lastUpdated).format('D MMM, YYYY')}
        {featured && <span><img src={StarPurple} role="presentation" aria-hidden alt="" /></span>}
      </p>

      <div className="card-search__title-wrapper">
        <h3 className="card-search__title">
          {title}
        </h3>

        {isFullWidth && (
          <div className="button-mobile-wrapper">
            <Button
              text={"View page"}
              ariaText={`View ${title}`}
              link={link || '/404'}
              showArrow
            />
          </div>
        )}
      </div>

      {text && <p className="card-search__body">{truncateToNearestWord(text, 160)}</p>}

      <div className='tags-wrapper'>
        {cardTags.length > 0 && <InlineTags tags={cardTags} />}
      </div>

      <div className="card-search__footer">
        <Button
          text={"View page"}
          ariaText={`View ${title}`}
          link={link || '/404'}
          showArrow
        />

        <div className="card-search__node-info">
          {audience && <p className="card-search__audience">{audience[0]}</p>}
          {type && <p className="card-search__type">{type}</p>}
        </div>
      </div>
    </div>
  )
}

export default CardSearch
