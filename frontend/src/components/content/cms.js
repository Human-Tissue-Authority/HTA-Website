import React, { useState, useEffect } from 'react'
import { animated, useSpring, config } from 'react-spring'
import { parseContent } from '../../utils/utils'
import ConditionalWrapper from '../helpers/ConditionalWrapper'

const CMS = props => {
  const { content, wide, sectionOverlayRef } = props
  const [contentHeight, setContentHeight] = useState(null)

  //set min height to adjust to section overlay 
  useEffect(() => {
    let minHeight = sectionOverlayRef?.current?.style?.cssText.split(': ')[1].replace(';', '')
    setContentHeight(minHeight)
  }, [sectionOverlayRef])

  const animation = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay:  500,
  })

  return (
    <ConditionalWrapper
      condition={typeof document !== 'undefined'}
      wrapper={children => (
        <animated.div
          className="cms cms-component columns"
          style={animation}
        >
          {children}
        </animated.div>
      )}
      elseWrapper={children => (
        <div className="cms cms-component columns">
          {children}
        </div>
      )}
    >
      <div className={`cms-col column ${wide ? 'is-9' : 'is-6'} is-offset-1`} dangerouslySetInnerHTML={{ __html: parseContent(content) }} style={{minHeight: contentHeight}} />
    </ConditionalWrapper>
  )
}

export default CMS
