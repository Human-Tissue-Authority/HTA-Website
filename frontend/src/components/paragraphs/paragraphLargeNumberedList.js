import React, { useState } from "react"
import {graphql} from "gatsby"
import NumberedTextarea from "./childParagraps/NumberedTextarea";
import ParagraphWrapper from "./paragraphWrapper";

const ParagraphLargeNumberedList = ({ node }) => {
  const [show, setShow] = useState(false)

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes="section cms cms-component paragraph-large-list columns"
    >
      <div className="column is-offset-1">
        {node.field_textarea.map((item, index) => (
          <NumberedTextarea
            key={item.processed}
            text={item.processed}
            number={index + 1}
          />
        ))}
      </div>
    </ParagraphWrapper>
  )
}

export default ParagraphLargeNumberedList

export const fragment = graphql`
  fragment ParagraphLargeNumberedList on paragraph__large_numbered_list {
    id
    field_textarea {
      processed
    }
  }
`
