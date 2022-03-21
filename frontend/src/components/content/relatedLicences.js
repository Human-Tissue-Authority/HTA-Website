import { Link } from 'gatsby'
import React, { useState, useEffect } from 'react'
import { animated, useSpring, config } from 'react-spring'
import ConditionalWrapper from '../helpers/ConditionalWrapper'

const RelatedLicences = props => {
  const { items, wide } = props

  const animation = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 400
  })

  const [mainLicence, setMainLicence] = useState(null)
  const [satellites, setSatellites] = useState([])
  
  // push any satellites into state array and set any main licences in state
  useEffect(() => {
    items.map(item => {
      if (!item.mainLicence) {
        setSatellites([...satellites, item])
        return
      }
  
      setMainLicence(item)
    })
  }, [])

  return (
    <ConditionalWrapper
      condition={typeof document !== 'undefined'}
      wrapper={children => (
        <animated.section
          style={animation}
          className="section related-licences columns"
        >
          {children}
        </animated.section>
      )}
      elseWrapper={children => (
        <section className="section related-licences columns">
          {children}
        </section>
      )}
    >
      <div className={`related-licences__inner-wrapper column ${wide ? 'is-9' : 'is-6'} is-offset-1`}>
        <h2 className="h related-licences__title section-title">Related Licences</h2>
        
        <div className="columns is-multiline">
          {mainLicence && (
            <div className="related-licences__main-licence column is-12 is-6-desktop">
              <p className="small-label">Main licence</p>
              <Link to={mainLicence.path.alias} className="small-content">
                {mainLicence.title}
              </Link>
            </div>
          )}

          <div className="related-licences__satellites column is-12 is-6-desktop">
            <p className="small-label">Satellites</p>
            {satellites.map(satellite => (
              <Link key={satellite.title} to={satellite.path.alias} className="small-content">
                {satellite.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ConditionalWrapper>

  )
}

export default RelatedLicences
