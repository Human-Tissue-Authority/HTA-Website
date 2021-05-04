import React from "react"
import PropTypes from "prop-types"
import { graphql } from 'gatsby'
import "../scss/main.scss"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import Title from "../components/content/title"
import InThisSection from "../components/navigation/inThisSection"
import KeyInformation from "../components/content/keyInformation"
import CMS from "../components/content/cms"
import FileDownloadGroup from "../components/content/fileDownloadGroup"
import paragraphHelper from "../components/helpers/paragraphHelper"
import NodePagination from "../components/navigation/nodePagination"
import TagGroup from "../components/content/tagGroup"
import { determineInThisSectionData } from "../utils/utils"

const Vacancy = props => {
  const { data: { nodeVacancy, allParentAndParentPeers, allChildren, allPeers, allParentAndChildPagesAndPeers }, pageContext: { next, previous } } = props

  const vacancyInformation = [
    {
      label: 'Salary information',
      value:  nodeVacancy.field_salary
    },
    {
      label: 'Closing date',
      value:  nodeVacancy.field_date
    }
  ]

  const nodeAttachments = nodeVacancy.relationships.field_attachment.map(item => {
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

  const paragraphs = paragraphHelper(nodeVacancy.relationships.paragraphs)

  return (
    <Layout classes="paginated" withSectionOverlay={!!nodeVacancy.in_this_section}>
      <SEO title={`${nodeVacancy.title} | Vacancy`} />
      <Breadcrumbs alias={nodeVacancy.path.alias} currentTitle={nodeVacancy.title} />

      <Title title={nodeVacancy.title} />

      <TagGroup tags={nodeVacancy.relationships.field_tags} />

      <div className="vacancy--info">
        <KeyInformation items={vacancyInformation}/>
      </div>

      <CMS content={nodeVacancy.body?.processed} />

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
            type={nodeVacancy.in_this_section}
            data={determineInThisSectionData(nodeVacancy.in_this_section, allParentAndParentPeers, allChildren, allPeers, allParentAndChildPagesAndPeers, nodeVacancy.relationships.manual)}
            currentPageAlias={nodeVacancy.path.alias}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Vacancy

export const query = graphql`
  query($VacancyId: String!, $NodeId: String!) {
    nodeVacancy(id: { eq: $VacancyId }) {
      title
      body {
        processed
      }
      path {
        alias
      }
      field_salary
      field_date(formatString: "D MMM, YYYY H:mm")
      in_this_section: field_in_this_section
      relationships {
        field_tags {
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
            ...ParagraphPublications
            ...ParagraphTextWithBackground
            ...ParagraphImageGallery
            ...ParagraphTextWithCTA
            ...ParagraphDocumentsListing
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

Vacancy.propTypes = {
  data: PropTypes.object.isRequired,
}
