import React, { useRef } from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import "../scss/main.scss"
import paragraphHelper from "../components/helpers/paragraphHelper"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import InThisSection from "../components/navigation/inThisSection"
import CMS from "../components/content/cms"
import Title from "../components/content/title"
import LastUpdated from "../components/content/lastUpdated"
import AnchorLinks from "../components/navigation/anchorLinks"
import { determineInThisSectionData } from "../utils/utils"

const Page = ({ data }) => {
  const { nodePage, allParentAndParentPeers, allChildren, allPeers, allParentAndChildPagesAndPeers } = data
  const paragraphs = paragraphHelper(nodePage.relationships.paragraphs)
  const sectionOverlayRef = useRef(null)

  return (
    <Layout withSectionOverlay={!!nodePage.in_this_section}>
      <SEO title={`${nodePage.title}`} />

      <Breadcrumbs alias={nodePage.path.alias} currentTitle={nodePage.title} />
      {nodePage.display_last_updated && (
        <LastUpdated timestamp={nodePage.changed} wide={nodePage.in_this_section == 'None'} />
      )}
      <Title title={nodePage.title} wide={nodePage.in_this_section == 'None'} />
      <CMS
        content={nodePage.body?.processed}
        sectionOverlayRef={sectionOverlayRef}
        wide={nodePage.in_this_section == 'None'}
      />

      {nodePage.display_anchor_links && (
        <AnchorLinks />
      )}
      
      {paragraphs}

      <div className="section--overlay">
        <div className="section--overlay--wrapper columns is-multiline">
          <InThisSection
            type={nodePage.in_this_section}
            data={determineInThisSectionData(nodePage.in_this_section, allParentAndParentPeers, allChildren, allPeers, allParentAndChildPagesAndPeers, nodePage.relationships.manual, sectionOverlayRef)}
            currentPageAlias={nodePage.path.alias}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Page

export const query = graphql`
  query($PageId: String!, $NodeId: String!) {
    nodePage(id: { eq: $PageId }) {
      body {
        processed
      }
      path {
        alias
      }
      title
      changed(formatString: "DD MMM Y")
      display_last_updated: field_display_last_updated_on_da
      display_anchor_links: field_display_anchor_links
      in_this_section: field_in_this_section
      relationships {
        paragraphs: field_add_paragraph {
          type: __typename
          ... on Node {
            ...ParagraphAccordion
            ...ParagraphSimpleText
            ...ParagraphWebform
            ...ParagraphLinksSection
            ...ParagraphListing
            ...ParagraphPublications
            ...ParagraphButtons
            ...ParagraphLargeNumberedList
            ...ParagraphPromotionalBlocks
            ...ParagraphTextWithBackground
            ...ParagraphBiography
            ...ParagraphImageGallery
            ...ParagraphTextWithCTA
            ...ParagraphDocumentsListing
            ...ParagraphManualListing
          }
        }

        manual: field_choose_items {
          ... on Node {
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
    }

    allChildren: allMenuItems(filter: {route: {parameters: {node: {eq: $NodeId}}}}) {
      nodes {
        url
        title
        id
        children {
          ... on MenuItems {
            id
            url
            title
          }
        }
      }
    }

    allParentAndParentPeers: allMenuItems(filter: {route: {parameters: {node: {eq: $NodeId}}}}) {
      nodes {
        parent {
          parent {
            ... on MenuItems {
              url
              title
            }
            children {
              ... on MenuItems {
                id
                url
                title
              }
            }
          }
        }
      }
    }

    allPeers: allMenuItems(filter: {route: {parameters: {node: {eq: $NodeId}}}}) {
      nodes {
        parent {
          children {
            ... on MenuItems {
              id
              url
              title
            }
          }
        }
      }
    }

    allParentAndChildPagesAndPeers: allMenuItems(filter: {route: {parameters: {node: {eq: $NodeId}}}}) {
      nodes {
        id
        parent {
          ... on MenuItems {
            id
            url
            title
          }
          children {
            ... on MenuItems {
              id
              url
              title
            }
          }
        }
        children {
          ... on MenuItems {
            id
            url
            title
          }
        }
      }
    }
  }
`

Page.propTypes = {
  data: PropTypes.object.isRequired,
}
