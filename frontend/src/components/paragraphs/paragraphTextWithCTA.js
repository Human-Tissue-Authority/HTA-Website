import React, { useState } from "react"
import { graphql } from "gatsby"
import Button from "../misc/button";
import ParagraphWrapper from "./paragraphWrapper";
import { parseContent } from "../../utils/utils";

const ParagraphTextWithCTA = ({ node }) => {
  const [show, setShow] = useState(false)

  const CTA = () => {
    const CTATitle = (node.field_cta && node.field_cta.title) ? node.field_cta.title : node.field_cta.uri
    const CTAUrl = (node.field_cta && node.field_cta.url) ? node.field_cta.url : ''

    return (
      <div  className="column is-10">
        <Button
          text={CTATitle}
          ariaText={CTATitle}
          link={CTAUrl}
          showArrow
        />
    </div>
    )
  }

  const body = (node.text && node.text.processed) ? node.text.processed : '';

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes="section cms cms-component paragraph-text-with-cta columns"
      paragraphTitle={node.title}
    >
      <div className={`paragraph-promotional-blocks__inner-wrapper column is-offset-1`}>
        <div className="paragraph-promotional-blocks__blocks columns is-multiline is-variable is-6">
          {node.title && (
            <h2 className="h h--2 column is-10">{node.title}</h2>
          )}
          <div  className="column is-10" dangerouslySetInnerHTML={{ __html: parseContent(body) }} />

          {node.field_cta && node.field_cta.url && CTA()}
        </div>
      </div>
    </ParagraphWrapper>
  )
}

export default ParagraphTextWithCTA

export const fragment = graphql`
  fragment ParagraphTextWithCTA on paragraph__text_with_cta {
    id
    title: field_title
    text: field_description {
      processed
    }
    field_cta {
      title
      uri
      url
    }
  }
`
