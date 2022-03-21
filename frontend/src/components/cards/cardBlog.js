import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import Button from '../misc/button'
import { truncateToNearestWord } from '../../utils/utils'
import dayjs from 'dayjs'

const CardBlog = props => {
  const {
    date,
    title,
    link,
    body,
    audience,
  } = props

  const [text, setText] = useState(null)

  useEffect(() => {
    if (body) {
      setText(body.join(' '))
    }
  }, [])

  return (
    <Link
      className="card card-blog"
      to={link || '/404'}
      aria-label={title}
    >
      <p className="card-blog__date">
        {dayjs(date).format('D MMM, YYYY')}
      </p>
      <h2 className="card-blog__title">
        {title}
      </h2>

      {text && <p className="card-blog__body">{truncateToNearestWord(text, 250)}</p>}

      <div className="card-blog__footer">
        <div className="button-custom-wrapper">
          <Button
            text={"Find out more"}
            showArrow
            fake
          />
        </div>

        <div className="card-blog__node-info">
          {audience.length > 0 && audience.map((item, i) => (
            <span key={i} className="card-blog__audience">{item}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default CardBlog
