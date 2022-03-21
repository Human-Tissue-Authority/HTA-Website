import React, { useState } from "react"
import { graphql } from "gatsby"
import { animated, useTransition, config } from "react-spring"
import { determineColumnClasses } from "../../utils/helpers"
import PromotionalBlock from "./childParagraps/promotionalBlock"
import ParagraphWrapper from "./paragraphWrapper"
import { parseContent } from "../../utils/utils"

const ParagraphPromotionalBlocks = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const columnClasses = determineColumnClasses(node.type, isFullWidth, node.width)
  const { blocks } = node.relationships

  const animationBlocks = useTransition(show && blocks, item => item.id, {
    unique: true,
    trail: 600 / blocks.length,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 400
  })

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes={`section paragraph-promotional-blocks columns ${isFullWidth ? 'is-full-width' : ''}`}
      paragraphTitle={node.title}
    >
      <div className="paragraph-promotional-blocks__background"/>
      <div className={`paragraph-promotional-blocks__inner-wrapper column ${columnClasses}`}>
        <div className="paragraph-promotional-blocks__blocks columns is-multiline is-variable is-5">
          {node.title && (
            <h2 className="h h--2 column is-12">{node.title}</h2>
          )}

          {node.text && (
            <div className="cms column is-12" dangerouslySetInnerHTML={{ __html: parseContent(node.text.processed) }} />
          )}

          {typeof document !== 'undefined' ? (
            <>
              {animationBlocks.map(({ item, key, props}) => item && (
                <animated.div
                  key={key}
                  style={props}
                  className={`column ${node.width === 'Wide' ? 'is-12 is-4-widescreen' : 'is-12 is-6-desktop'}`}
                >
                  <PromotionalBlock
                    title={item.field_title}
                    summary={item.field_summary}
                    linkText={item.field_cta?.title}
                    linkUrl={item.field_cta?.url}
                  />
                </animated.div>
              ))}
            </>
          ) : (
            <>
              {blocks.map(item => (
                <div
                  className={`column ${node.width === 'Wide' ? 'is-12 is-4-widescreen' : 'is-12 is-6-desktop'}`}
                >
                  <PromotionalBlock
                    title={item.field_title}
                    summary={item.field_summary}
                    linkText={item.field_cta?.title}
                    linkUrl={item.field_cta?.url}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </ParagraphWrapper>
  )
}

export default ParagraphPromotionalBlocks

export const fragment = graphql`
  fragment ParagraphPromotionalBlocks on paragraph__promotional_blocks {
    title: field_title
    text: field_description {
      processed
    }
    width: field_display
    relationships {
      blocks: field_block {
        id
        field_title
        field_summary
        field_cta {
          title
          url
        }
      }
    }
  }
`
