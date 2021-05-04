import { Link } from 'gatsby'
import React from 'react'

const CardEstablishment = props => {
  const {
    url,
    licenceNumber,
    licensedPremises,
    licenceType,
    licenceStatus,
    sector
  } = props

  return (
    <Link to={url} aria-label={`View ${licensedPremises}`} className="card card-establishment">
      <h3 className="visuallyhidden">{licensedPremises}</h3>
      <div className="columns">
        <div className="column is-2 is-3-mobile card-establishment__licence-number">{licenceNumber}</div>
        <div className="column is-4 is-6-mobile card-establishment__licensed-premises">{licensedPremises}</div>
        <div className="column is-2 card-establishment__licence-type">{licenceType}</div>
        <div className="column is-2 card-establishment__licence-status">{licenceStatus}</div>
        <div className="column is-2 is-3-mobile card-establishment__sector">{sector}</div>
      </div>
    </Link>
  )
}

export default CardEstablishment
