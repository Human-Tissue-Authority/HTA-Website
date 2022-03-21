import React, { useEffect, useRef } from 'react'
import { animated, useTransition, config } from "react-spring"
import CardEstablishment from '../cards/cardEstablishment';
import CardMedicalSchool from '../cards/cardMedicalSchool';
import Pagination from './pagination';

const ContentListingTable = props => {
  const {
    items,
    total,
    itemsPerPage,
    handlePagination,
    currentPage,
    cardType,
    classes,
    setListingHeight,
    cardClasses,
    noscriptMessage
  } = props
  
  const animatedCards = useTransition(items, item => item?.its_nid || item?.id, {
    unique: true,
    trail: 800 / items.length,
    config: config.stiff,
    from: { opacity: 0, transform: 'translateX(-10px)' },
    enter: { opacity: 1, transform: 'translateX(0)' }
  })
  
  const getCard = item => {
    switch (cardType) {
      case 'establishment':
        return (
          <CardEstablishment
            url={item.url}
            licenceNumber={item.licenceNumber}
            licensedPremises={item.licensedPremises}
            licenceType={item.licenceType}
            licenceStatus={item.licenceStatus}
            sector={item.sector}
          />
        )
      case 'medical-school':
        return (
          <CardMedicalSchool
            url={item.url}
            name={item.name}
            postcodes={item.postcodes}
            phone={item.phone}
            contactName={item.contactName}
          />
        )
      default:
        return null;
    }
  }
  
  const listingRef = useRef(null)
  
  useEffect(() => {
    // whenever the results change, update the min-height of the listing container to match 
    // this prevents jumpiness when changing/filtering results
    if (listingRef && listingRef.current) {
      setListingHeight(`${listingRef.current.clientHeight}px`)
    }
  }, [listingRef])

  return (
    <div ref={listingRef} className={`content-listing ${classes || ''}`}>
      <div className="content-listing__wrapper">
        <span className="accessibility" role="alert" aria-live="polite">
          {`${total} results returned.`}
        </span>

        {items.length > 0 ? (
          <>
            {animatedCards.map(({ item, key, props}) => item && (
              <animated.div
                key={key}
                style={props}
                className={cardClasses}
              >
                {getCard(item)}
              </animated.div>
            ))}

            {total > itemsPerPage && (
              <Pagination
                itemsPerPage={itemsPerPage}
                totalItems={total}
                handlePagination={handlePagination}
                forcePage={currentPage || 0}
              />
            )}
          </>
        ) : (
          <div className="content-listing__no-results">
            Sorry, no results match your search criteria.

            {noscriptMessage && (
              <noscript>
                <br />
                <br />
                You are seeing this message because you have JavaScript disabled or because your browser does not support it. Our website requires JavaScript to be enabled in order to fully function.
                <br />
                <br />
                Find out more about enabling <a href="https://www.enable-javascript.com" target="_blank">JavaScript</a>.
                <br />
                <br />
                You can contact the HTA for the information you are seeking:
                <br />
                you can email us at <a href="mailto:enquiries@hta.gov.uk">enquiries@hta.gov.uk</a> or call us between the hours of 9am - 5pm Monday Friday on <a href="tel:020 7269 1900">020 7269 1900</a>
              </noscript>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentListingTable