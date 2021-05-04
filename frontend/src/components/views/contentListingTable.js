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
    cardClasses
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
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentListingTable