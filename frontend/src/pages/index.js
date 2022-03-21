import React from "react"
import PropTypes from "prop-types"
import { Link, graphql } from "gatsby"
import { animated, useSpring, config } from 'react-spring'

import paragraphHelper from "../components/helpers/paragraphHelper"
import Layout from "../components/layout"
import SEO from "../components/seo"

import ArrowPurple from "../images/arrow-purple.svg"
import ConditionalWrapper from "../components/helpers/ConditionalWrapper"

const IndexPage = ({ data }) => {
  const homeData = data.allNodeHomepage.nodes[0]
  const paragraphs = paragraphHelper(homeData.relationships.paragraphs, true)
  const HPImage = (homeData.relationships.field_image) ? homeData.relationships.field_image.relationships.field_media_image?.localFile?.childImageSharp?.fluid?.originalImg : ''
  const TPTitle =  (homeData.relationships.field_image) ? <h1 style={{ color: '#fff'}}>{homeData.title}</h1> : <h1>{homeData.title}</h1>

  const animation = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 }
  })

  return (
    <Layout classes="home">
      <SEO title="Home" />

      <ConditionalWrapper
        condition={typeof document !== 'undefined'}
        wrapper={children => (
          <animated.section style={animation} className="home-banner">{children}</animated.section>
        )}
        elseWrapper={children => <section className="home-banner">{children}</section>}
      >
        <div className="home-banner__inner-wrapper columns">
          <div className="home-banner__title column is-8" style={{ backgroundImage: `url(${HPImage})`, backgroundSize: "cover"}}>
            {TPTitle}
            <h2 className="home-banner__strapline">{homeData.field_strapline}</h2>
            <div className="home-banner__cta">
              <a href={homeData.field_url.url}>{homeData.field_url.title}</a>
            </div>
          </div>

          <div className="home-banner__links column is-4">
            <div className="home-banner__links-wrapper">
              <h2 className="home-banner__links-title">POPULAR PAGES</h2>
              <ul>
                {homeData.relationships.field_i_would_like_to_.map(item => (
                  <li>
                    <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
                    <Link to={item.relationships.field_i_would_like_to_?.path?.alias}>
                      {item.field_title || item.relationships.field_i_would_like_to_.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </ConditionalWrapper>

      {paragraphs}
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query {
    allNodeHomepage {
      nodes {
        title
        field_strapline
        field_url {
          url
          title
        }
        relationships {
          field_image {
            relationships {
              field_media_image {
                localFile {
                  childImageSharp {
                    fluid(maxWidth: 1000) {
                      base64
                      tracedSVG
                      srcWebp
                      srcSetWebp
                      originalImg
                      originalName
                    }
                  }
                }
              }
            }
          }
          paragraphs: field_add_paragraph {
            type: __typename
            ... on Node {
              ...ParagraphSimpleText
              ...ParagraphLinksSection
              ...ParagraphListing
              ...ParagraphPromotionalBlocks
              ...ParagraphImageGallery
            }
          }
          field_i_would_like_to_ {
            field_title
            relationships {
              field_i_would_like_to_ {
                ... on Node {
                  ... on node__article {
                    title
                    path {
                      alias
                    }
                  }
                  ... on node__blog {
                    title
                    path {
                      alias
                    }
                  }
                  ... on node__medical_school {
                    path {
                      alias
                    }
                    title
                  }
                  ... on node__meeting {
                    path {
                      alias
                    }
                    title
                  }
                  ... on node__page {
                    title
                    path {
                      alias
                    }
                  }
                  ... on node__vacancy {
                    path {
                      alias
                    }
                    title
                  }
                }
              }
              ...i_would_like_to_relationships
            }
          }
        }
      }
    }
  }

  fragment i_would_like_to_relationships on paragraph__i_would_like_to_Relationships {
    paragraph_type {
      id
    }
  }
`

IndexPage.propTypes = {
  data: PropTypes.node.isRequired,
}
