import React, { useState, useEffect } from "react"
import { animated, useTransition, config } from "react-spring"
import AnchorLink from 'react-anchor-link-smooth-scroll'

import ArrowPurple from "../../images/arrow-purple.svg"
import ParagraphWrapper from '../paragraphs/paragraphWrapper'
import { useHasMounted } from "../../utils/hooks"

const AnchorLinks = () => {
  const [show, setShow] = useState(false)
  const [links, setLinks] = useState(null)

  useEffect(() => {
    const paragraphs = Array.from(document.querySelectorAll('.paragraph'))
    const paragraphsWithIDs = paragraphs.filter(paragraph => paragraph.id !== "")
    const paragraphLinks = paragraphsWithIDs.map(paragraph => {
      return {
        label: paragraph.dataset.title,
        link: paragraph.id
      }
    })

    setLinks(paragraphLinks)
  }, []);

  const animationLinks = useTransition(show && links, item => item.link, {
    unique: true,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 200
  })

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted();	

  if (!hasMounted) {	
    return null	
  }

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromTop"
      classes="section paragraph-links-section paragraph-links-section--anchor-links background-color background-color--alice-blue columns"
    >
      <div className="paragraph-links-section__inner-wrapper column is-6 is-offset-1">
          <h2 className="title--small column is-12">On this page</h2>

          <div className="column is-12">
            <ul className="columns is-multiline is-4 is-variable">
              {animationLinks.map(({ item, key, props }) => item.link && (
                <animated.li style={props} key={key} className="column is-12 is-6-widescreen">
                  <img src={ArrowPurple} role="presentation" alt="" />
                  <AnchorLink offset="80" href={item.link ? `#${item.link}` : '#'}>
                    <div dangerouslySetInnerHTML={{ __html: item.label }} />
                  </AnchorLink>
                </animated.li>
              ))}
            </ul>
          </div>
        </div>
    </ParagraphWrapper>
  )
}

export default AnchorLinks
