import React, { useState } from "react"
import { graphql, Link } from "gatsby"
import { animated, useTransition, config } from "react-spring"
import { determineColumnClasses } from "../../utils/helpers"

import ArrowPurple from "../../images/arrow-purple.svg"
import ParagraphWrapper from "./paragraphWrapper"

const ParagraphLinksSection = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const { links } = node.relationships
  const columnClasses = determineColumnClasses(node.type, isFullWidth, node.width)

  const animationLinks = useTransition(show && links, item => item.id, {
    unique: true,
    trail: 600 / links.length,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 200
  })

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes={`section paragraph-links-section columns ${node.backgroundColorEnabled ? 'background-color' : ''} ${node.backgroundColorEnabled && node.backgroundColor ? `background-color--${node.backgroundColor.replace(' ', '-').toLowerCase()}` : ''}`}
      paragraphTitle={node.title}
      >
        <div className={`paragraph-links-section__inner-wrapper column ${columnClasses}`}>
          {node.title && (
            <h2 className="title--small column is-12">{node.title}</h2>
          )}

          <div className="column is-12">
            <ul className="columns is-multiline is-4 is-variable">
              {animationLinks.map(({ item, key, props }) => {
                if (item && item.path) {
                  return (
                    <animated.li style={props} key={key} className={`column ${node.width === 'Wide' ? 'is-6 is-4-widescreen' : 'is-12 is-6-widescreen'}`}>
                      <img src={ArrowPurple} role="presentation" alt="" />
                      <Link to={item.path?.alias || '/'}>
                        {item.title }
                      </Link>
                    </animated.li>
                  )
                }

                return null
              })}
            </ul>
          </div>
        </div>
    </ParagraphWrapper>
  )
}

export default ParagraphLinksSection

export const fragment = graphql`
  fragment ParagraphLinksSection on paragraph__links_section {
    id
    title: field_title
    backgroundColorEnabled: field_add_background_colour
    backgroundColor: field_colour
    width: field_display
    relationships {
      links: field_node_link {
        type: __typename
        ... on node__article {
          id
          title
          path {
            alias
          }
        }
        ... on node__blog {
          id
          title
          path {
            alias
          }
        }
        ... on node__establishment {
          id
          title
          path {
            alias
          }
        }
        ... on node__meeting {
          id
          title
          path {
            alias
          }
        }
        ... on node__page {
          id
          title
          path {
            alias
          }
        }
        ... on node__vacancy {
          id
          title
          path {
            alias
          }
        }
      }
    }
  }
`
