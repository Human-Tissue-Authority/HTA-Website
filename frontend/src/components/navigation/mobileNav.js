import { Link } from 'gatsby'
import React, { useRef, useState, useEffect } from 'react'
import { useTransition, useSpring, animated, useChain, config } from 'react-spring'

import ArrowWhite from '../../images/arrow-white.svg'

const MobileNav = props => {
  const { open, menuItems, subMenuOpen, setSubMenuOpenMethod } = props
  const [subMenuItems, setSubMenuItems] = useState([])

  // menu animations
  const menuRef = useRef()
  const menuOpenAnimation = useSpring({
    ref: menuRef,
    config: config.stiff,
    from: { opacity: 0 },
    to: { opacity: open && !subMenuOpen ? 1 : 0, paddingBottom: '10px'}
  })

  const menuItemsRef = useRef()
  const menuItemsAnimation = useTransition(open && !subMenuOpen ? menuItems : [], item => item.id, {
    ref: menuItemsRef,
    unique: true,
    trail: 200 / menuItems.length,
    from: { opacity: 0, transform: 'translateX(-20px)' },
    enter: { opacity: 1, transform: 'translatex(0)' },
    leave: { opacity: 0, transform: 'translateX(0)' }
  })

  const subMenuRef = useRef()
  const subMenuOpenAnimation = useSpring({
    ref: subMenuRef,
    config: config.stiff,
    from: { opacity: 0, position: 'absolute', top: 0, pointerEvents: 'none' },
    to: { opacity: subMenuOpen ? 1 : 0,  paddingBottom: '10px', pointerEvents: 'auto' }
  })

  const subMenuItemsRef = useRef()
  const subMenuItemsAnimation = useTransition(open && subMenuOpen ? subMenuItems : [], item => item.id, {
    ref: subMenuItemsRef,
    unique: true,
    trail: 200 / subMenuItems.length,
    from: { opacity: 0, transform: 'translateX(-20px)' },
    enter: { opacity: 1, transform: 'translatex(0)' },
    leave: { opacity: 0, transform: 'translateX(0)' }
  })

  // creates the animation chain
  // if menu is open run menuRef animation with 0s delay, followed by menuItemsRef animation with 0.1s delay
  // else run menuItemsRef first with 0s delay, followed by menuRef with 0.x delay
  useChain(open && !subMenuOpen ? [menuRef, menuItemsRef] : [menuItemsRef, menuRef], [0, open ? 0.1 : 0.3])

  // submenu animation chain
  useChain(subMenuOpen && subMenuItems.length > 0 ? [subMenuRef, subMenuItemsRef] : [subMenuItemsRef, subMenuRef], subMenuOpen ? [0.4, 0.6] : [0, 0.3])

  // menu functionality
  const [prevMenuText, setPrevMenuText] = useState(null)
  const openSubMenu = activeItem => {
    setSubMenuItems(activeItem.children)
    setPrevMenuText(activeItem.title)
    setSubMenuOpenMethod(true)
  }

  const mobileNavRef = useRef(null)

  useEffect(() => {
    if (mobileNavRef && mobileNavRef.current) {
      mobileNavRef.current.focus()
    }
  }, [mobileNavRef])

  const focusClose = e => {
    e.preventDefault()
    document.querySelector('button.header__menu-button').focus()
  }
  
  // focus menu when tabbing backwards from parent link
  const handleShiftTabOut = e => {
    const keyCode = e.keyCode || e.which;   

    if (keyCode === 9 && e.shiftKey) {
      focusClose(e)
    }
  }

  // focus menu when tabbing backwards from parent link
  const handleTabOut = e => {
    const keyCode = e.keyCode || e.which;   

    if (keyCode === 9 && !e.shiftKey) {
      focusClose(e)
    }
  }

  return (
    <div className="mobile-nav">
      <animated.ul className="mobile-nav__menu" style={menuOpenAnimation}>
        {menuItemsAnimation.map(({ item, key, props }, i) => (
          <animated.li key={key} style={props}>
            {i === 0 && (
              <Link to={item.url} ref={mobileNavRef} >
                {item.title}
                <img src={ArrowWhite} aria-hidden alt="" />
              </Link>
            )}

            {i > 0 && item.title !== 'Portal login' && item?.children?.length === 0 && (
              <Link to={item.url}>
                {item.title}
                <img src={ArrowWhite} aria-hidden alt="" />
              </Link>
            )}

            {i > 0 && item.title !== 'Portal login' && item?.children?.length > 0 && (
              <button type="button"  onClick={() => openSubMenu(item)}>
                {item.title}
                <img src={ArrowWhite} aria-hidden alt="" />
              </button>
            )}

            {item.title === 'Portal login' && (
              <a href={item.url} className="mobile-nav__portal-login" target="_blank" onKeyDown={e => handleTabOut(e)}>
                {item.title}
              </a>
            )}
          </animated.li>
        ))}
      </animated.ul>
      
      <animated.ul className="mobile-nav__submenu" style={subMenuOpenAnimation}>
        <li className="previous-menu-button">
          <button type="button" onClick={() => setSubMenuOpenMethod(false)} onKeyDown={e => handleShiftTabOut(e)}>
            <img src={ArrowWhite} aria-hidden alt="" />
            {prevMenuText}
          </button>
        </li>

        {subMenuItemsAnimation.map(({ item, key, props }, i) => (
          <animated.li key={key} style={props}>
            {i !== subMenuItemsAnimation.length - 1 ? (
              <Link to={item.url}>
                {item.title}
              </Link>
            ) : (
              <Link to={item.url} onKeyDown={e => handleTabOut(e)}>
                {item.title}
              </Link>
            )}
          </animated.li>
        ))}
      </animated.ul>
    </div>
  )
}

export default MobileNav
