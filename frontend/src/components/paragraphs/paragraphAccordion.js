import React, { useState, useEffect } from "react"
import { graphql } from "gatsby"
import ParagraphWrapper from "./paragraphWrapper"
import Accordion from "../content/accordion"
import { parseContent } from "../../utils/utils"

const ParagraphAccordion = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const [expand, setExpand] = useState(false)
  const [expandNested, setExpandNested] = useState(false)

  const title = node?.field_title
  const nestedAccordion = node?.relationships?.field_accordion

  const handleChangeExpand = (e, summary) => {
    e.stopPropagation()
    setExpand(prevState => {
      if (prevState === summary) {
        setExpandNested(null)
        return null
      } else {
        return summary
      }
    })
  }

  const handleChangeExpandNested = (e, summary) => {
    e.stopPropagation()
    setExpandNested(prevState => prevState === summary ? null : summary)
  }

  const NestedAccordion = () => {
    return (
      nestedAccordion.map(accordion => (
        <Accordion
          summary={accordion.field_title}
          details={<div className="webform__body" dangerouslySetInnerHTML={{ __html: parseContent(accordion.field_description?.value) }} />}
          duration={500}
          expand={expandNested}
          onExpand={handleChangeExpandNested}
          classes={'paragraph-accordion-nested'}
        />
      ))
    )
  }

  useEffect(() => {
    const paragraphAccordions = document.getElementsByClassName('paragraph-accordion')
    const length = paragraphAccordions.length
    if (paragraphAccordions.length > 0) {
      paragraphAccordions[0].style.padding = '40px 0 0 0'
    }

    if (paragraphAccordions.length > 1) {
      paragraphAccordions[length - 1].style.padding = '0 0 70px 0'
    }
  }, [])

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes="section paragraph-accordion"
    >
      <div className="paragraph-accordion__wrapper columns">
        <div className="column is-10 is-offset-1">
          <Accordion
            summary={title}
            details={NestedAccordion()}
            duration={500}
            expand={expand}
            onExpand={handleChangeExpand}
            classes={'paragraph-accordion-content'}
          />
        </div>
      </div>
    </ParagraphWrapper>
  )
}

export default ParagraphAccordion

export const fragment = graphql`
  fragment ParagraphAccordion on paragraph__accordion_wrapper {
    id
    field_title
    relationships {
      field_accordion {
        field_title
        field_description {
          value
        }
      }
    }
  }
`
