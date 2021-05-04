import React, { useRef } from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import "../scss/main.scss"

import Layout from "../components/layout"
import SEO from "../components/seo"
import paragraphHelper from "../components/helpers/paragraphHelper"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import Title from "../components/content/title"
import TagGroup from "../components/content/tagGroup"
import FollowBlog from "../components/forms/followBlog"
import FileDownloadGroup from "../components/content/fileDownloadGroup"
import NodePagination from "../components/navigation/nodePagination"
import CMS from "../components/content/cms"
import BlogComments from "../components/views/blogComments"

const Blog = props => {
  const {data: {nodeBlog}, pageContext: { next, previous } } = props
  const paragraphs = paragraphHelper(nodeBlog.relationships.paragraphs)

  const nodeAttachments = nodeBlog.relationships.field_attachment && nodeBlog.relationships.field_attachment.map(item => {
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

  const titleRef = useRef(null)

  return (
    <Layout withSectionOverlay>
      <SEO title={`${nodeBlog.title} | Blog`} />
      <Breadcrumbs alias={nodeBlog.path.alias} currentTitle={nodeBlog.title} />
      <Title ref={titleRef} title={nodeBlog.title} />
      <TagGroup tags={nodeBlog.relationships.field_tags}/>
      
      <CMS content={nodeBlog.body?.value} />
      
      {nodeAttachmentsCleaned && nodeAttachmentsCleaned.length > 0 && (
          <FileDownloadGroup files={nodeAttachmentsCleaned} wide/>
      )}
      
      {paragraphs}
      
      <NodePagination
        prevNode={previous}
        nextNode={next}
      />

      <BlogComments nid={nodeBlog.drupal_internal__nid} comments={nodeBlog.relationships?.comment__blog}/>

      <div className="section--overlay">
        <div className="section--overlay--wrapper columns is-multiline">
          <FollowBlog nid={nodeBlog.drupal_internal__nid} />
        </div>
      </div>
    </Layout>
  )
}

export default Blog

export const query = graphql`
  query($BlogId: String!) {
    nodeBlog(id: { eq: $BlogId }) {
      id
      drupal_internal__nid
      title 
      path {
        alias
      }
      body {
        value
      }
      created(formatString: "Do MMMM YYYY")
      relationships {
        field_tags {
          label: name
        }
        comment__blog {
          id
          field_comment
          field_name
          field_last_name
          created
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
            ...ParagraphButtons
            ...ParagraphLargeNumberedList
            ...ParagraphTextWithBackground
            ...ParagraphBiography
            ...ParagraphImageGallery
            ...ParagraphTextWithCTA
          }
        }
      }
    }
  }
`

Blog.propTypes = {
  data: PropTypes.object.isRequired,
}
