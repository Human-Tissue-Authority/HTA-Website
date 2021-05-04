import React from 'react'
import { Link } from 'gatsby'
import { animated, useSpring, config } from 'react-spring'
import ArrowPurple from '../../images/arrow-purple.svg'

const InThisSection = props => {
  const { type, data, currentPageAlias } = props
  let nodesData;
  let componentData;

  const animationAside = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 }
  })

  if (type === 'None') {
    return null
  }

  if (data?.nodes)  {
    nodesData = type === 'Manual' ? data?.nodes : data?.nodes[0]
  }

  if (data?.component) {
    //react component to render
    componentData = data.component
  }

  if (!nodesData && !componentData) {
    return null
  }

  let menuComponent

  switch (type) {
    case `Parent & parent's peers`:
      const parent = nodesData?.parent?.parent

      if (parent && parent?.children) {
        menuComponent = parent.children.map(item => (
          <li key={item.title}>
            <Link to={item.url}>
              <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
              {item.title}
            </Link>
          </li>
        ))
      }

      break
    case `All child pages`:
      if (nodesData?.children?.length > 0) {
        menuComponent = nodesData.children.map(item => (
          <li key={item.title}>
            <Link to={item.url}>
              <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
              {item.title}
            </Link>
          </li>
        ))
      }

      break
    case `All peers`:
      // filter out current page from peers
      if (nodesData.parent?.children?.length > 0) {
        const peersOnly = nodesData.parent.children.filter(item => item.url !== currentPageAlias)

        if (peersOnly.length > 0) {
          menuComponent = peersOnly.map(item => (
            <li key={item.title}>
              <Link to={item.url}>
                <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
                {item.title}
              </Link>
            </li>
          ))
        }
      }

      break
    case `Parent, child pages & peers`: 
      const parentLink = nodesData?.parent
      const peersLinks = parentLink?.children || []
      const childLinks = nodesData?.children || []

      if (parentLink) {
        menuComponent = (
          <li>
            <Link to={parentLink.url}>
              <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
              {parentLink.title}
            </Link>

            {peersLinks.length > 0 && (
              <ul>
                {peersLinks.map(item => {
                  if (item.id !== nodesData.id) {
                    return (
                      <li key={item.title}>
                        <Link to={item.url}>
                          <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
                          {item.title}
                        </Link>
                      </li>
                    )
                  } else {
                    return (
                      <li>
                        <Link to={item.url}>
                          <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
                          {item.title}
                        </Link>

                        {childLinks.length > 0 && (
                          <ul>
                            {childLinks.map(childLink => (
                              <li key={childLink.title}>
                                <Link to={childLink.url}>
                                  <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
                                  {childLink.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  }
                })}
              </ul>
            )}
          </li>
        )
      }

      break
    case `Manual`:
      if (nodesData && nodesData?.length > 0) {
        menuComponent = nodesData.map(item => (
          <li key={item.title}>
            <Link to={item.url}>
              <img src={ArrowPurple} aria-hidden role="presentation" alt="" />
              {item.title}
            </Link>
          </li>
        ))
      }
      break
  }

  return (
    <>
      {componentData && (
        <animated.div
          style={animationAside}
          className="in-this-section__no-padding column is-4"
        >
          {componentData}
        </animated.div>
      )}

      {nodesData && menuComponent && (
        <animated.div
          style={animationAside}
          className="in-this-section column is-4"
        >
        <div className="in-this-section__inner-wrapper">
          <h2 className="in-this-section__title">
            In this section
          </h2>
          <ul className="in-this-section__links">
            {menuComponent}
          </ul>
        </div>  
      </animated.div>
      )}
    </>
  )
}

export default InThisSection
