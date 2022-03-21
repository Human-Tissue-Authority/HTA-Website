import React from 'react'
import CardPublication from '../cards/cardPublication';
import CardSearch from '../cards/cardSearch';

const NoJsContentListing = props => {
  const {
    items,
    itemsPerPage,
    cardType,
    columns,
    columnsResponsive,
    classes,
    cardClasses,
  } = props

  const formattedItems = items.filter(item => item).slice(0, itemsPerPage);

  return (
    <div className={`content-listing ${classes || ''}`}>
      <div className="content-listing__wrapper columns is-multiline is-variable is-4">
        {formattedItems && formattedItems.map(item => (
          <div
            key={item?.its_nid || item?.id}
            className={`column is-${columnsResponsive || 6}-tablet is-${columns || 4}-widescreen ${cardClasses}`}
          >
            {cardType === 'publication' ? (
              <CardPublication
                type={item.type}
                date={item.date}
                title={item.title}
                summary={item.summary}
                link={item.link}
                image={item.image}
              />
            ) : (
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
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NoJsContentListing
