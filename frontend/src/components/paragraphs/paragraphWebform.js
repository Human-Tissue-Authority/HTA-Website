import React, { useState } from 'react'
import { graphql } from "gatsby"
import { determineColumnClasses } from "../../utils/helpers"
import ParagraphWrapper from "./paragraphWrapper"

import WebformContact from '../forms/webformContact'

const ParagraphWebform = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  
  const renderWebform = () => {
    const webform_id = node.field_webform_name

    switch(webform_id) {
      case 'contact':
        return <WebformContact title={node.field_title} body={node.field_description} />
    }
  }
  
  if (node.field_webform_name) {
    return (
      <ParagraphWrapper
        show={show}
        setShow={setShow}
        animationStyle="fadeInFromRight"
        classes="section paragraph-webform"
        paragraphTitle={node.field_title}
      >
        {renderWebform()}
      </ParagraphWrapper>
    )
  }

  return null
}

export default ParagraphWebform

export const fragment = graphql`
  fragment ParagraphWebform on paragraph__webform {
    id
    field_title
    field_description {
      processed
    }
    field_webform_name
  }
`
