import React from 'react'
import { Link } from 'gatsby'

const CardMedicalSchool = props => {
  const {
    url,
    name,
    postcodes,
    phone,
    contactName,
  } = props

  return (
    <Link to={url} aria-label={`View ${name}`} className="card card-medical-school">
      <h3 className="visuallyhidden">{name}</h3>
      <div className="columns">
        <div className="column is-2 is-4-mobile card-medical-school__name">{name}</div>
        <div className="column is-2 is-4-mobile card-medical-school__postcodes">{postcodes}</div>
        <div className="column is-2 is-4-mobile card-medical-school__phone">{phone}</div>
        <div className="column is-6 is-3-mobile card-medical-school__contact-name">{contactName}</div>
      </div>
    </Link>
  )
}

export default CardMedicalSchool
