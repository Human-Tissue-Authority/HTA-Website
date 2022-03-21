import React, { useEffect, useState, useRef } from "react"
import { graphql } from "gatsby"
import ParagraphWrapper from "./paragraphWrapper"
import { extension } from 'mime-types'
import ContentListing from "../views/contentListing"
import NoJsContentListing from "../views/noJsContentListing"

const ITEMS_PER_PAGE = 20

const ParagraphPublications = ({ node }) => {
  const [show, setShow] = useState(false)
  const { field_document_item: listingItems } = node.relationships

  // functionality
  const [loading, setLoading] = useState(true)
  // const [items, setItems] = useState(null)
  const [currentItems, setCurrentItems] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [listingHeight, setListingHeight] = useState('auto')
  const listingRef = useRef(null)

  const items = listingItems.map(item => {
    const itemType = item.__typename
    const documentImage = item.relationships?.field_image?.relationships?.field_media_image?.localFile?.childImageSharp.fluid.src

    if (itemType === 'paragraph__image_and_cta') {
      return {
        itemType,
        id: item.id,
        type: 'Link',
        date: item.created,
        title: item.field_cta?.title,
        link: item.field_cta?.url,
        image: documentImage
      }
    } else {
      const documentData = item.relationships?.field_document_single

      return {
        itemType,
        id: item.id,
        type: documentData?.relationships?.field_media_file?.filemime ? extension(documentData.relationships.field_media_file.filemime) : 'Document',
        date: item?.created,
        title: documentData?.name,
        summary: item?.field_document_summary,
        link:  process.env.API_ROOT + documentData?.relationships?.field_media_file?.uri?.url,
        image: documentImage,
      }
    }
  })

  useEffect(() => {
    setCurrentItems(items.slice(0, ITEMS_PER_PAGE))
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
          classes="section paragraph-publications columns is-multiline"
        >
          {node.field_title && (
            <div className="paragraph-publications__title column is-12">
              <div className="paragraph-publications__title-wrapper columns">
                <h2 className="h h--2 column is-5 is-offset-1">{node.field_title}</h2>
              </div>
            </div>
          )}

          <div className="publications-listing column is-12" style={{ minHeight: listingHeight }}>
            {!loading && (
              <ContentListing
                items={currentItems}
                total={items.length}
                itemsPerPage={ITEMS_PER_PAGE}
                handlePagination={handlePagination}
                currentPage={currentPage}
                cardType="publication"
                classes="search-results"
                setListingHeight={setListingHeight}
                columns={3}
                cardClasses="is-4-desktop"
              />
            )}

            {typeof document === 'undefined' && (
              <NoJsContentListing
                items={items}
                itemsPerPage={ITEMS_PER_PAGE}
                cardType="publication"
                classes="search-results"
              />
            )}
          </div>
        </ParagraphWrapper>
      )}
    </>
  )
}

export default ParagraphPublications

export const fragment = graphql`
  fragment ParagraphPublications on paragraph__publications {
    id
    field_title
    relationships {
      field_document_item {
        ... on paragraph__image_and_cta {
          id
          created
          field_cta {
            title
            url
          }
          relationships {
            field_image {
              relationships {
                field_media_image {
                  localFile {
                    childImageSharp {
                      fluid(maxWidth: 1920, quality: 100) {
                        ...GatsbyImageSharpFluid
                      }
                    }
                  }
                }
              }
            }
          }
        }
        ... on paragraph__document {
          id
          created
          field_document_summary
          relationships {
            field_image {
              relationships {
                field_media_image {
                  localFile {
                    childImageSharp {
                      fluid(maxWidth: 1920, quality: 100) {
                        ...GatsbyImageSharpFluid
                      }
                    }
                  }
                }
              }
            }
            field_document_single {
              changed
              name
              relationships {
                field_media_file {
                  filemime
                  changed
                  uri {
                    url
                    value
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
