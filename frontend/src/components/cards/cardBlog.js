import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import InlineTags from '../content/inlineTags'
import Button from '../misc/button'
import { truncateToNearestWord } from '../../utils/utils'
import dayjs from 'dayjs'

const CardBlog = props => {
  const {
    date,
    title,
    link,
    body,
    tags,
    audience,
  } = props

  const [text, setText] = useState(null)
  const [cardTags, setCardTags] = useState([])

  useEffect(() => {
    if (body) {
      setText(body.join(' '))
    }
    const cleanedTags = tags && tags.filter(tag => tag)

    if (cleanedTags.length > 0) {
      // flatten multi-dimensional array
      const tagsArray = [].concat.apply([], cleanedTags)
      setCardTags(tagsArray)
    }
  }, [])

  return (
    <div className="card card-blog">
      <p className="card-blog__date">
        {dayjs(date).format('D MMM, YYYY')}
      </p>
      <h3 className="card-blog__title">
        {title}
      </h3>

      {text && <p className="card-blog__body">{truncateToNearestWord(text, 250)}</p>}

      {cardTags.length > 0 && <InlineTags tags={cardTags} />}

      <div className="card-blog__footer">
        <div className="button-custom-wrapper">
          <Button
            text={"Find out more"}
            ariaText={`View ${title}`}
            link={link || '/404'}
            showArrow
          />
        </div>

        <div className="card-blog__node-info">
          {audience.length > 0 && audience.map((item, i) => (
            <span key={i} className="card-blog__audience">{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CardBlog
