import React, { useState } from "react"
import {graphql} from "gatsby"
import { animated, useTransition, config } from "react-spring"
import Button from "../misc/button";
import ParagraphWrapper from "./paragraphWrapper";

const ParagraphButtons = ({ node }) => {
  const [show, setShow] = useState(false)
  const BtnLinks = node.field_cta_multi

  const animationButtons = useTransition(show && BtnLinks, item => item.url, {
    unique: true,
    trail: 600 / BtnLinks.length,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 200
  })

  if (BtnLinks && BtnLinks.length > 0) {
    return (
      <ParagraphWrapper
        show={show}
        setShow={setShow}
        animationStyle="fadeIn"
        classes="section cms cms-component paragraph-buttons columns"
      >
        <div className="paragraph-buttons__wrapper column is-6 is-offset-1">
          {animationButtons.map(({ item, key, props }) => item.title && item.url && (
            <animated.div style={props} key={key}>
              <Button
                text={item.title}
                ariaText={item.title}
                link={item.url}
                showArrow
              />
            </animated.div>
          ))}
        </div>
      </ParagraphWrapper>
    )
  }

  return null
}

export default ParagraphButtons

export const fragment = graphql`
  fragment ParagraphButtons on paragraph__button {
    id
    field_cta_multi {
      title
      uri
      url
    }
  }
`
