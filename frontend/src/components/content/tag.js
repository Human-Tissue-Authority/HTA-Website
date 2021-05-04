import { Link } from 'gatsby'
import React from 'react'

const Tag = props => {
  const { data } = props

  if (data.label && data.url) {
    return (
      <Link className="tag tag--link" to={data.url}>
        {data.label}
      </Link>
    )
  } else if (data.label) {
    return (
      <span className="tag">{data.label}</span>
    )
  }

  return null
}

export default Tag
