import React from "react"
import PropTypes from "prop-types"
import { graphql, Link } from "gatsby"
import "../scss/main.scss"

import paragraphHelper from "../components/helpers/paragraphHelper"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import LastUpdated from "../components/content/lastUpdated"
import {animated, config, useSpring} from "react-spring"
import ArrowPurple from "../images/arrow-purple.svg"
import Title from "../components/content/title"
import TagGroup from "../components/content/tagGroup"
import KeyInformation from "../components/content/keyInformation"
import CMS from "../components/content/cms"
import FileDownloadGroup from "../components/content/fileDownloadGroup"

const Meeting = ({ data }) => {
  const { nodeMeeting } = data

  const animationAside = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 }
  })

  const nodeAttachments = nodeMeeting.relationships.field_attachment.map(item => {
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

  const meetingInformation = [
    {
      label: 'Date',
      value: nodeMeeting.field_date
    },
    {
      label: 'Audience',
      value:  nodeMeeting.relationships.field_audience.map(item => item.label),
    },
    {
      label: 'Meeting Type',
      value:  nodeMeeting.relationships.field_family.map(item => item.label),
      wide: true
    }
  ]

  const paragraphs = paragraphHelper(nodeMeeting.relationships.paragraphs)

  return (
    <Layout withSectionOverlay>
      <SEO title={`${nodeMeeting.title} | Meeting`} />
      <Breadcrumbs alias={nodeMeeting.path.alias} currentTitle={nodeMeeting.title} />
      <LastUpdated timestamp={nodeMeeting.changed} />

      <Title title={nodeMeeting.title} />
      <TagGroup tags={nodeMeeting.relationships.field_tags} />

      <KeyInformation items={meetingInformation} />

      <CMS content={nodeMeeting.body?.processed} />

      {nodeAttachmentsCleaned && nodeAttachmentsCleaned.length > 0 && (
        <FileDownloadGroup files={nodeAttachmentsCleaned}/>
      )}
      {paragraphs}

      <div className="section--overlay">
        <div className="section--overlay--wrapper columns is-multiline">
          <animated.div
            style={animationAside}
            className="in-this-section column is-4"
          >
            <div className="in-this-section__inner-wrapper">
              <Link to="/meetings">
                <img src={ArrowPurple} role="presentation" aria-hidden alt="" />
                Back to meetings
              </Link>
            </div>

          </animated.div>
        </div>
      </div>
    </Layout>
  )
}

export default Meeting

export const query = graphql`
  query($MeetingId: String!) {
    nodeMeeting(id: { eq: $MeetingId }) {
      body {
        processed
      }
      path {
        alias
      }
      title
      changed(formatString: "DD MMM Y")
      field_date(formatString: "D MMM, YYYY H:mm")
      relationships {
        field_tags {
          label: name
        }
        field_family {
          label: name
        }
        field_audience {
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
            ...ParagraphImageGallery
            ...ParagraphDocumentsListing
          }
        }
      }
    }
  }
`

Meeting.propTypes = {
  data: PropTypes.object.isRequired,
}
