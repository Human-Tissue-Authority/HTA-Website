import React, { useState, useEffect } from "react"
import { graphql } from "gatsby"
import { determineColumnClasses } from "../../utils/helpers"
import ParagraphWrapper from "./paragraphWrapper"
import { parseContent } from "../../utils/utils"

const ParagraphSimpleText = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const columnClasses = determineColumnClasses(node.type, isFullWidth, node.width)
  
  if (!node.text) {
    return null
  }

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes="section cms cms-component paragraph-text columns is-multiline"
      paragraphTitle={node.title}
    >
      {node.title && (
        <h2 className={`h h--2 column ${columnClasses}`}>{node.title}</h2>
      )}

      <div className={`column ${columnClasses}`} dangerouslySetInnerHTML={{ __html: parseContent(node.text.processed) }} />
    </ParagraphWrapper>
  )
}

export default ParagraphSimpleText

export const fragment = graphql`
  fragment ParagraphSimpleText on paragraph__simple_text {
    id
    width: field_display
    title: field_title
    text: field_text {
      processed
    }
  }
`
