import React from 'react'
import { animated, useSpring, useTransition, config } from 'react-spring'
import ButtonThin from '../misc/buttonThin'

const FileDownloadGroup = props => {
  const { files, title, wide } = props

  const animationBlock = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 400
  })
  
  const animationFiles = useTransition(files, item => item.label, {
    unique: true,
    trail: 600 / files.length,
    config: config.stiff,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    delay: 1000
  })

  return (
    <animated.section
      style={animationBlock}
      className="section file-download-group columns" 
    >
      <div className={`file-download-group__inner-wrapper column is-6 is-offset-1`}>
        {title && (
          <h2 className="h section-title">
            {title}
          </h2>
        )}

        <ul className={`columns is-multiline ${wide ? ' ' : 'is-6'} is-6 is-variable`}>
          {animationFiles.map(({ item, key, props }) => (
            <animated.li style={props} key={key} className={`column ${wide ? 'is-12' : 'is-6'}`}>
              <ButtonThin ariaLabelText={`Download ${item.label}`} text={item.label} link={item.url} />
            </animated.li>
          ))}
        </ul>
      </div>
    </animated.section>
  )
}

export default FileDownloadGroup
