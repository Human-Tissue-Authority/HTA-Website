import React, { useState } from "react"
import { graphql } from "gatsby"
import ParagraphWrapper from "./paragraphWrapper"
import FileDownloadGroup from "../content/fileDownloadGroup"
import { parseContent } from "../../utils/utils"

const ParagraphDocumentsListing = ({ node }) => {
  const [show, setShow] = useState(false)
  const body = (node.field_description && node.field_description.processed) ? node.field_description.processed : '';

  const nodeAttachments = node.relationships.field_document.map(item => {
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
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes="section paragraph-documents-listing"
      paragraphTitle={node.title}
    >
      <div className={`paragraph-promotional-blocks__inner-wrapper cms cms-component columns`}>
        <div className={`column is-offset-1 is-6`}>
          {node.field_title && (
            <h2 className="h section-title column is-12">{node.field_title}</h2>
          )}
          <div  className="column is-12" dangerouslySetInnerHTML={{ __html: parseContent(body) }} />
        </div>
      </div>
      {nodeAttachmentsCleaned && nodeAttachmentsCleaned.length > 0 && (
        <FileDownloadGroup files={nodeAttachmentsCleaned} wide/>
      )}
    </ParagraphWrapper>
  )
}

export default ParagraphDocumentsListing

export const fragment = graphql`
  fragment ParagraphDocumentsListing on paragraph__documents_listing {
    id
    field_title
    field_description {
      processed
    }
    relationships {
      field_document {
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
    }
  }
`
