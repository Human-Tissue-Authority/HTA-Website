import React, { useEffect, useState, useRef } from "react"
import { graphql } from "gatsby"
import ParagraphWrapper from "./paragraphWrapper"
import ContentListing from "../views/contentListing"

const ITEMS_PER_PAGE = 9

const ParagraphManualListing = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const { field_listing_item: listingItems } = node.relationships

  // functionality
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState(null)
  const [currentItems, setCurrentItems] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [listingHeight, setListingHeight] = useState('auto')
  const listingRef = useRef(null)

  useEffect(() => {
    if (listingItems && listingItems.length > 0) {
      // format items
      const formattedItems = listingItems.map(item => {

        if (item?.relationships?.field_node_item?.id) {
          const itemData = item.relationships?.field_node_item

          const generalTags = itemData.relationships?.field_tags?.map(tag => tag.name) || []
          const sectorTags = itemData.relationships?.field_sector?.map(tag => tag.name) || []
          const audience = itemData.relationships?.field_audience?.map(tag => tag.name) || null
  
          const bodyContainer = document.createElement('div')
          bodyContainer.innerHTML = itemData?.body?.processed.trim()
  
          const tags = [...generalTags, ...sectorTags]

          return {
            id: itemData.id,
            title: itemData.title,
            link: itemData.path?.alias,
            changed: itemData.changed,
            body: itemData.body ? bodyContainer?.innerText : '',
            tags,
            type: itemData.type,
            newsType: itemData.field_news_type,
            audience,
            featured: item.featured
          }
        }
      })

      setItems(formattedItems)
      setCurrentItems(formattedItems.slice(0, ITEMS_PER_PAGE))
    }
  }, [])

  useEffect(() => {
    if (currentItems.length > 0) {
      setLoading(false)
    }
  }, [currentItems])

  // handle pagination
  const handlePagination = paginationData => {
    const listingScrollPos = listingRef?.current?.offsetTop - 100
    setLoading(true)
    const { selected } = paginationData
    const offsetVal = Math.ceil(selected * ITEMS_PER_PAGE)

    setCurrentPage(selected)

    window.scrollTo({
      top: listingScrollPos,
      behavior: 'smooth'
    })

    const itemsRef = items
    const nextItems = itemsRef.slice(offsetVal, offsetVal + ITEMS_PER_PAGE)
    setCurrentItems(nextItems)
  }

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      {items && (
        <ParagraphWrapper
          show={show}
          setShow={setShow}
          animationStyle="fadeInFromLeft"
          classes="section paragraph-manual columns"
        >
          <div className="manual-listing" style={{ minHeight: listingHeight }}>
            {show && !loading && (
              <ContentListing
                items={currentItems}
                total={items.length}
                itemsPerPage={ITEMS_PER_PAGE}
                handlePagination={handlePagination}
                currentPage={currentPage}
                cardType="general"
                classes="search-results"
                setListingHeight={setListingHeight}
              />
            )}
          </div>
        </ParagraphWrapper>
      )}
    </>
  )
}

export default ParagraphManualListing

export const fragment = graphql`
  fragment ParagraphManualListing on paragraph__manual_listing {
    id
    relationships {
      field_listing_item {
        featured: field_featured_
        relationships {
          field_node_item {
            ... on Node {
              type: __typename
              ... on node__article {
                id
                title
                body {
                  processed
                }
                changed
                field_news_type
                path {
                  alias
                }
                relationships {
                  field_sector {
                    name
                  }
                  field_tags {
                    name
                  }
                  field_audience {
                    name
                  }
                }
              }
              ... on node__blog {
                id
                title
                body {
                  processed
                }
                changed
                path {
                  alias
                }
                relationships {
                  field_tags {
                    name
                  }
                  field_audience {
                    name
                  }
                }
              }
              ... on node__establishment {
                id
                title
                changed
                path {
                  alias
                }
              }
              ... on node__foi {
                id
                title
                changed
                path {
                  alias
                }
                relationships {
                  field_sector {
                    name
                  }
                  field_tags {
                    name
                  }
                  field_audience {
                    name
                  }
                }
              }
              ... on node__meeting {
                id
                title
                body {
                  processed
                }
                changed
                path {
                  alias
                }
                relationships {
                  field_sector {
                    name
                  }
                  field_tags {
                    name
                  }
                  field_audience {
                    name
                  }
                }
              }
              ... on node__page {
                id
                title
                body {
                  processed
                }
                changed
                path {
                  alias
                }
                relationships {
                  field_tags {
                    name
                  }
                  field_audience {
                    name
                  }
                }
              }
              ... on node__vacancy {
                id
                title
                body {
                  processed
                }
                changed
                path {
                  alias
                }
                relationships {
                  field_audience {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
