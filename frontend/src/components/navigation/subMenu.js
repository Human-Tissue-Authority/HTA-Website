import React, { useRef, useEffect, useCallback } from 'react'
import { useTransition, animated, useChain, config } from 'react-spring'
import { Link } from 'gatsby'

import ArrowWhite from '../../images/arrow-white.svg'
import { useHasMounted } from '../../utils/hooks'

const SubMenu = props => {
  const { data, open, menuChanging, setOpenMethod, setMenuChangingMethod } = props

  const subMenuRef = useRef()
  const subMenuTransition = useTransition(open, null, {
    ref: subMenuRef,
    config: config.gentle,
    unique: true,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })

  const parentLinkRef = useRef()
  const parentLinkTransition = useTransition(!menuChanging, null, {
    ref: parentLinkRef,
    config: config.gentle,
    unique: true,
    reset: true,
    from: { opacity: 0, transform: 'translateX(-20px)' },
    enter: { opacity: 1, transform: 'translatex(0)' },
    leave: { opacity: 0, transform: 'translateX(10px)' }
  })

  const menuItemsRef = useRef()
  const menuItemsTransition = useTransition(!menuChanging ? data.children : [], item => item.id, {
    ref: menuItemsRef,
    config: config.stiff,
    trail: 200 / data?.children?.length,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0, position: 'absolute' }
  })

  useChain(
    open ? [subMenuRef] : [subMenuRef],
    open ? [0] : [0.4] 
  )

  useChain(
    !menuChanging ? [parentLinkRef, menuItemsRef] : [menuItemsRef, parentLinkRef],
    !menuChanging ? [0.2, 0.5] : [0, 0.2] 
  )

  useEffect(() => {
    const parentLink = document.querySelector('.header-submenu__parent-link')
    
    if (open && !menuChanging && parentLink) parentLink.focus()
  }, [menuChanging])

  // focus menu when tabbing backwards from parent link
  const handleParentLinkTab = e => {
    const keyCode = e.keyCode || e.which;   
    
    if (e.shiftKey && keyCode === 9) {
      e.preventDefault()
      document.querySelector('.active-parent-menu-item a').focus()
    }
  }

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted();	

  if (!hasMounted) {	
    return null	
  }

  return subMenuTransition.map(({ item, key, props }) => item && (
    <animated.section
      className="header-submenu"
      style={props}
      key={key}
    >
      {data && (
        <div className="header-submenu__outer-wrapper">
          <div className="header-submenu__menu">
            <div className="header-submenu__inner-wrapper">
              {parentLinkTransition.map(({ item, key, props }) => item && (
                <animated.div style={{ ...props, display: 'inline-block' }} key={key}>
                  <Link
                    className="header-submenu__parent-link"
                    to={data.url}
                    onKeyDown={e => handleParentLinkTab(e)}
                  >
                    <img src={ArrowWhite} role="presentation" alt="" />
                    {data.title}
                  </Link>
                </animated.div>
              ))}

              {data.children && data.children.length > 0 && (
                <ul className="columns is-multiline">
                  {menuItemsTransition.map(({ item, key, props }) => (
                    <animated.li key={key} style={props} className="column is-3">
                      <Link to={item.url}>
                        {item.title}
                      </Link>
                    </animated.li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            type="button"
            className="header-submenu__close"
            aria-level="close submenu"
            onClick={() => {
              setOpenMethod(false)
              setMenuChangingMethod(true)
              document.querySelector('.header__logo').focus()
            }}
          />
        </div>
      )}
    </animated.section>
  ))
}

export default SubMenu
