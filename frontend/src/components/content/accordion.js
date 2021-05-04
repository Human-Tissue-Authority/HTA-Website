import React from "react"
import AnimateHeight from 'react-animate-height';
import { useSpring, config, animated } from "react-spring";
import ArrowWhite from '../../images/chevron-up.svg'

const Accordion = ({ summary, details, classes = 'accordion', onExpand, expand, hideArrow, arrow, duration }) => {
  const isActive = expand === summary;
  const height = isActive ? 'auto' : 0
  const animation = useSpring({
    transform: isActive ? 'rotate(360deg)' : 'rotate(180deg)'
  })
  
  const handleExpand = e => {
    onExpand(e, summary)
  } 

  return (
    <div className={`accordion-wrapper ${classes}${isActive ? ' expanded' : ''}`}>
      <div className={`${classes}__summary`} onClick={handleExpand}>
        {summary}

        {!hideArrow && !arrow && (
          <div className={`accordion__arrow-wrapper`} onClick={handleExpand}>
            <animated.img src={ArrowWhite} role="presentation" style={animation} className={`accordion__arrow`}/>
          </div>
        )}
        
        {arrow && (
          {arrow}
        )}
        
      </div>
      <AnimateHeight
        className={`${classes}__details`} 
        height={height}
        duration={duration}
       >
        {details}
      </AnimateHeight>
      
      {/* only for browser print view */}
      <div className="print-view">
        {details}
      </div>
    </div>
  )

}

export default Accordion