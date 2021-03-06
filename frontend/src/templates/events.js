import React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import "../scss/main.scss"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import LastUpdated from "../components/content/lastUpdated"
import Title from "../components/content/title"
import CMS from "../components/content/cms"
import TagGroup from "../components/content/tagGroup"
import KeyInformation from "../components/content/keyInformation"
import InThisSection from "../components/navigation/inThisSection"
import paragraphHelper from "../components/helpers/paragraphHelper"
import NodePagination from "../components/navigation/nodePagination"
import FileDownloadGroup from "../components/content/fileDownloadGroup";
import { determineInThisSectionData } from "../utils/utils"

const Events = props => {
  const { data: { nodeArticle, allParentAndParentPeers, allChildren, allPeers, allParentAndChildPagesAndPeers }, pageContext: { next, previous } } = props

  const paragraphs = paragraphHelper(nodeArticle.relationships.paragraphs)

  const eventsInformation = [
    {
      label: 'Venue',
      value:  nodeArticle.field_venue
    },
    {
      label: 'Date',
      value:  nodeArticle.date
    },
    {
      label: 'Time',
      value:  nodeArticle.time
    },
    {
      label: 'Contact',
      type: 'contact',
      value: [
        {
          name: nodeArticle.field_contact_name
        }, 
        {
          phone: nodeArticle.field_contact_telephone
        }, 
        {
          email: nodeArticle.field_contact_email
        }
      ]
    }
  ]

  const nodeAttachments = nodeArticle.relationships.field_attachment.map(item => {
    if (item.relationships) {
      const url = process.env.API_ROOT + item.relationships.field_media_file.uri.url
      const label = item.relationships.field_media_file.filename

      return {
        url,
        label
      }
    }
  })

  const nodeAttachmentsCleaned = nodeAttachments.filter(item => item != null)

  return (
    <Layout classes="paginated" withSectionOverlay={!!nodeArticle.in_this_section}>
      <SEO title={`${nodeArticle.title} | Events`} />
      <Breadcrumbs alias={nodeArticle.path.alias} currentTitle={nodeArticle.title} />
      <LastUpdated timestamp={nodeArticle.created} published />

      <Title title={nodeArticle.title} />
      <TagGroup tags={nodeArticle.relationships.field_tags} />
      <TagGroup tags={nodeArticle.relationships.field_sector} />

      <div className="vacancy--info">
        <KeyInformation items={eventsInformation}/>
      </div>

      <CMS content={nodeArticle.body?.processed} />

      {nodeAttachmentsCleaned && nodeAttachmentsCleaned.length > 0 && (
        <FileDownloadGroup files={nodeAttachmentsCleaned} wide/>
      )}

      {paragraphs}

      <NodePagination
        comparisonField="field_date"
        prevNode={previous}
        nextNode={next}
      />

      <div className="section--overlay">
        <div className="section--overlay--wrapper columns is-multiline">
          <InThisSection
            type={nodeArticle.in_this_section}
            data={determineInThisSectionData(nodeArticle.in_this_section, allParentAndParentPeers, allChildren, allPeers, allParentAndChildPagesAndPeers, nodeArticle.relationships.manual)}
            currentPageAlias={nodeArticle.path.alias}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Events

export const query = graphql`
  query($ArticleId: String!, $NodeId: String!) {
    nodeArticle(id: { eq: $ArticleId }) {
      body {
        processed
      }
      path {
        alias
      }
      title
      created(formatString: "DD MMM Y")
      changed(formatString: "DD MMM Y")
      in_this_section: field_in_this_section
      field_venue
      date: field_date(formatString: "D MMMM, YYYY")
      time: field_date(formatString: "h:mma")
      field_contact_name
      field_contact_telephone
      field_contact_email
      relationships {
        field_tags {
          label: name
        }
        field_sector {
          label: name
        }
        field_attachment {
          relationships {
            field_media_file {
              filename
              uri {
                url
                value
              }
            }
          }
        }
        paragraphs: field_add_paragraph {
          type: __typename
          ... on Node {
            ...ParagraphAccordion
            ...ParagraphSimpleText
            ...ParagraphWebform
            ...ParagraphPublications
            ...ParagraphButtons
            ...ParagraphLargeNumberedList
            ...ParagraphTextWithBackground
            ...ParagraphBiography
            ...ParagraphImageGallery
            ...ParagraphTextWithCTA
          }
        }

        manual: field_choose_items {
          type: __typename
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

Events.propTypes = {
  data: PropTypes.object.isRequired,
}
