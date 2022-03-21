import React, { useState, useEffect } from "react"
import { graphql } from "gatsby"
import { animated, useTransition, config } from "react-spring"
import { determineColumnClasses } from "../../utils/helpers"
import truncate from 'truncate'

import Button from "../misc/button"
import ParagraphWrapper from "./paragraphWrapper"

import ArrowPurple from "../../images/arrow-purple.svg"
import { useHasMounted } from "../../utils/hooks"

const ParagraphImageGallery = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const columnClasses = determineColumnClasses(node.type, isFullWidth, node.width)

  // gallery functionality
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [touched, setTouched] = useState(false)
  const galleryItems = node.relationships.galleryItem

  const galleryTransitions = useTransition(galleryItems[galleryIndex], item => item.id, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.slow
  })

  // automatically scroll through carousel images
  useEffect(() => {
    let autoScroll
    
    if (!touched) {
      autoScroll = setInterval(() => {
        setGalleryIndex(state => (state + 1) % galleryItems.length)
      }, 4000)
    } else {
      clearInterval(autoScroll)
    }

    return clearInterval(autoScroll)
  }, [touched])

  const navigateCarousel = direction => {
    if (direction === 'right') {
      setGalleryIndex(currentIndex => {
        const nextImageIndex = currentIndex + 1;

        if (nextImageIndex === galleryItems.length) {
          return 0
        }

        return nextImageIndex
      })
    } else {
      setGalleryIndex(currentIndex => {
        const prevImageIndex = currentIndex - 1;

        if (prevImageIndex < 0) {
          return galleryItems.length - 1
        }

        return prevImageIndex
      })
    }
  }

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return null
  }

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeIn"
      classes={`section paragraph-image-gallery ${node.width === 'Wide' ? 'paragraph-image-gallery--full-width' : ''}`}
      paragraphTitle={node.title}
    >
      {galleryTransitions.map(({ item, key, props }) => (
        <animated.div
          key={key}
          style={props}
          className="gallery-item__wrapper columns"
          onClick={() => {
            if (!touched)
              setTouched(true)
          }}
        >
          <div
            style={{ backgroundImage: `url(${item.relationships.field_image.relationships.field_media_image.localFile?.childImageSharp.fluid.src})` }}
            className={`gallery-item__inner-wrapper column ${columnClasses}`}
          >
            <div className="gallery-item__bg-overlay"/>
            <div className={`gallery-item__content-wrapper columns is-multiline ${!isFullWidth && node.width === 'Thin' ? 'gallery-item__content-wrapper--thin' : ''}`}>
              <div className={`gallery-item__text column ${!isFullWidth && node.width === 'Thin' ? 'is-12' : 'is-12-tablet is-6-widescreen'}`}>
                {item.title && <h2 className="h gallery-item__title">{item.title}</h2>}

                {item.body && (
                  <div 
                    className="cms gallery-item__body"
                    dangerouslySetInnerHTML={{ __html: truncate(item.body.processed, 250) }}
                  />
                )}

                {item.cta && item.cta.uri && (
                  <Button
                    text={item.cta.title}
                    link={item.cta.uri.replace('interal:', '')}
                    showArrow
                  />
                )}
              </div>
            </div>
          </div>
        </animated.div>
      ))}

      {galleryItems.length > 1 && (
        <div className="paragraph-image-gallery__controls columns">
          <div className={`paragraph-image-gallery__controls-wrapper column ${!isFullWidth && node.width === 'Thin' ? 'is-6 is-offset-1' : 'is-12'}`}>

            {galleryItems.map((item, i) => (
              <button
                type="button"
                aria-label={`Skip to gallery image: ${i + 1}`}
                className={`paragraph-image-gallery__control-dots ${galleryIndex === i ? 'paragraph-image-gallery__control-dots--active' : ''}`}
                onClick={() => setGalleryIndex(i)}
              />
            ))}

            <button
              type="button"
              className="paragraph-image-gallery__control-button paragraph-image-gallery__control-button--left"
              aria-label="Show previous image"
              onClick={() => navigateCarousel('left')}
            >
              <img src={ArrowPurple} role="presentation" aria-hidden alt="" />
            </button>
    
            <button
              type="button"
              aria-label="Show next image"
              className="paragraph-image-gallery__control-button paragraph-image-gallery__control-button--right"
              onClick={() => navigateCarousel('right')}
            >
              <img src={ArrowPurple} role="presentation" aria-hidden alt="" />
            </button>
          </div>
        </div>
      )}
    </ParagraphWrapper>
  )
}

export default ParagraphImageGallery

export const fragment = graphql`
  fragment ParagraphImageGallery on paragraph__image_gallery {
    id
    width: field_display
    relationships {
      galleryItem: field_ga {
        id
        title: field_title
        body: field_description {
          processed
        }
        cta: field_cta {
          title
          uri
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
    }
  }
`
