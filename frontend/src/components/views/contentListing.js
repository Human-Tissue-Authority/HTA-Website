import React, { useEffect, useRef } from 'react'
import { animated, useTransition, config } from "react-spring"
import CardBlog from '../cards/cardBlog';
import CardCurrentVacancy from '../cards/cardCurrentVacancy';
import CardEvent from '../cards/cardEvent';
import CardNews from '../cards/cardNews';
import CardPublication from '../cards/cardPublication';
import CardSearch from '../cards/cardSearch';
import CardMeeting from '../cards/cardMeeting';
import Pagination from './pagination';
import CardFoi from '../cards/cardFoi';

const ContentListing = props => {
  const {
    items,
    total,
    itemsPerPage,
    loading,
    handlePagination,
    currentPage,
    cardType,
    columns,
    columnsResponsive,
    classes,
    setListingHeight,
    cardClasses,
    noResultsMessage
  } = props

  const animatedCards = useTransition(items, item => item?.its_nid || item?.id, {
    unique: true,
    trail: 800 / items.length,
    config: config.stiff,
    from: { opacity: 0, transform: 'translateY(-10px) scale(1.02)' },
    enter: { opacity: 1, transform: 'translateY(0) scale(1)' }
  })

  const getClassNames = index => {
    switch(cardType) {
      case 'search-full-width' : 
        return `column is-12 ${cardClasses}`
      case 'news' : 
        const isFirstItem = index === 0
        return `column is-${isFirstItem ? 12 : 6}-tablet is-${isFirstItem ? 12 : 4}-widescreen ${cardClasses}`
      default :
        return `column is-${columnsResponsive || 6}-tablet is-${columns || 4}-widescreen ${cardClasses}`
    }
  }

  const getCard = (item, index) => {
    switch (cardType) {
      case 'general':
        return (
          <CardSearch
            lastUpdated={item.changed}
            title={item.title}
            link={item.link}
            body={[item.body]}
            tags={item.tags}
            audience={item.audience}
            newsType={item.newsType}
            contentType={item.type?.replace('node__', '').split('_').join(' ')}
            featured={item.featured}
            buttonText={item.buttonText}
            date={item.date}
          />
        )
      case 'search':
      case 'search-full-width':
        return (
          <CardSearch
            lastUpdated={item.ds_changed}
            title={item.ss_title}
            link={item.ss_alias}
            body={item.tm_X3b_en_body}
            tags={[item.sm_tags, item.sm_sector_tags]}
            audience={item.sm_audience}
            newsType={item.ss_field_news_type}
            contentType={item.ss_type?.split('_').join(' ')}
            isFullWidth={cardType === 'search-full-width'}
            fullWidthClass='search-full-width'
          />
        )
      case 'currentVacancy':
        return (
          <CardCurrentVacancy
            createdDate={item.created}
            title={item.title}
            link={item.link}
            body={item.body}
            closingDate={item.closingDate}
            summary={item.summary}
          />
        )
      case 'publication':
        return (
          <CardPublication
            type={item.type}
            date={item.date}
            title={item.title}
            link={item.link}
            image={item.image}
          />
        )
      case 'blog':
        return (
          <CardBlog
            title={item.title}
            link={item.link}
            body={item.body}
            tags={item.tags}
            audience={item.audience}
            date={item.date}
          />
        )
      case 'event':
        return (
          <CardEvent
            title={item.title}
            link={item.link}
            body={[item.body]}
            tags={item.tags}
            summary={item.summary}
            audience={item.audience}
            date={item.date}
            venue={item.venue}
            contact={item.contact}
          />
        )
      case 'news':
        return (
          <CardNews
            title={item.title}
            link={item.link}
            body={[item.body]}
            tags={[item.sector, item.tags]}
            summary={item.summary}
            audience={item.audience}
            date={item.date}
            index={index}
            />
        )
      case 'meeting':
        return (
          <CardMeeting
            title={item.title}
            link={item.link}
            timestamp={item.timestamp}
            family={item.family}
          />
        )
      case 'foi':
        return (
          <CardFoi
            title={item.title}
            link={item.link}
            body={[item.body]}
            tags={[...item.sector, ...item.tags]}
            summary={item.summary}
            audience={item.audience}
            date={item.date}
            attachment={item.attachment}
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
      <div className="content-listing__wrapper columns is-multiline is-variable is-4">
        {animatedCards.map(({ item, key, props}, index) => item && (
          <animated.div
            key={key}
            style={props}
            className={getClassNames(index)}
          >
            {getCard(item, index)}
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
        {items.length < 1 && !loading && (
          <div className="no-results">{noResultsMessage || 'Sorry, no results match your search criteria.'}</div>
        )}
      </div>
    </div>
  )
}

export default ContentListing
