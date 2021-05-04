import React, { useState } from "react"
import { graphql } from "gatsby"
import { determineColumnClasses } from "../../utils/helpers"

import ParagraphWrapper from "./paragraphWrapper"
import { parseContent } from "../../utils/utils"

const ParagraphTextWithBackground = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const columnClasses = determineColumnClasses(node.type, isFullWidth)
  const body = (node.text && node.text.processed) ? node.text.processed : '';

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromRight"
      classes={`
        section paragraph-text-with-background columns 
        ${node.backgroundColor ? `background-color--${node.backgroundColor.replace(' ', '-').toLowerCase()}` : ''}
        ${node.textColor ? `text-color--${node.textColor.replace(' ', '-').toLowerCase()}` : ''}
      `}
      paragraphTitle={node.title}
    >
  `   <div className={`paragraph-text-with-background__inner-wrapper column  ${columnClasses}`}>
        <div className="paragraph-text-with-background__ text-wrapper columns">
          <div className="cms column is-11 is-offset-1" dangerouslySetInnerHTML={{ __html: parseContent(body) }} />
        </div>
      </div>`
    </ParagraphWrapper>
  )
}

export default ParagraphTextWithBackground

export const fragment = graphql`
  fragment ParagraphTextWithBackground on paragraph__text_with_background {
    id
    title: field_title
    text: field_description {
      processed
    }
    backgroundColor: field_colour
    textColor: field_text_colour
  }
`
