import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useStaticQuery, graphql, Link } from "gatsby"

import Logo from "../../images/logo.svg"
import SearchIcon from "../../images/search.svg"
import MobileNav from "../navigation/mobileNav"
import Search from "../navigation/search"
import SubMenu from "../navigation/subMenu"
import { useHasMounted } from "../../utils/hooks"

import ChevronDownWhite from '../../images/chevron-down--white.svg'

const Header = ({ forceSearchOpen }) => {
  const data = useStaticQuery(graphql`
    {
      allMenuItems(filter: {menu_name: {eq: "main"}, parent: {id: {eq: null}}}, sort: {order: DESC, fields: weight}) {
        nodes {
          title
          url
          id
          weight
          parent {
            id
          }
          children {
            ... on MenuItems {
              id
              url
              title
            }
          }
        }
      }
    }
  `)

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState(false)

  const toggleMenu = () => {
    if (mobileNavOpen || mobileSubMenuOpen) {
      setMobileNavOpen(false)
      setMobileSubMenuOpen(false)
    } else {
      setMobileNavOpen(true)
    }
  }

  // desktop submenu functionality
  const [activeMenuItem, setActiveMenuItem] = useState(null)
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [menuChanging, setMenuChanging] = useState(true)

  const activeMenuItemRef = useRef(null)
  const subMenuOpenRef = useRef(false)

  const closeSubmenu = () => {
    setSubMenuOpen(false)
    subMenuOpenRef.current = false
    setMenuChanging(true)
  }

  const setActiveSubmenu = (e, parentMenuItem) => {
    if (e) e.preventDefault()

    // close submenu
    if ((activeMenuItem && activeMenuItem === parentMenuItem && e.type !== 'mouseenter') && subMenuOpen) {
      closeSubmenu()
    } else if (activeMenuItem && activeMenuItem !== parentMenuItem && subMenuOpen) {
      setMenuChanging(true)

      setTimeout(() => {
        setActiveMenuItem(parentMenuItem)
        activeMenuItemRef.current = parentMenuItem
        setMenuChanging(false)
      }, 500)
    } else {
      setMenuChanging(false)
      setSubMenuOpen(true)
      subMenuOpenRef.current = true
      setActiveMenuItem(parentMenuItem)
      activeMenuItemRef.current = parentMenuItem
    }
  }

  const [searchOpen, setSearchOpen] = useState(false)
  const [headerEl, setHeaderEl] = useState(null)

  useEffect(() => {
    if (headerEl && forceSearchOpen) setSearchOpen(forceSearchOpen)
  }, [headerEl])

  const openSearch = () => {
    setSearchOpen(true)
    setSubMenuOpen(false)
    setMenuChanging(true)
  }

  const navMouseHoverStateHandler = (e, isEnter) => {
    const mainNavItemsLinks = document.querySelectorAll('.header__main-nav a')
    const mainNavItemsBtns = document.querySelectorAll('.header__main-nav button')
    const { currentTarget } = e

    const distributeClasses = items => {
      items.forEach(el => {
        if (isEnter && el !== currentTarget ) {
          el.classList.add('hover-state-faded')
        } else if (!isEnter) {
          el.classList.remove('hover-state-faded')
        }
      });
    }

    if ((mainNavItemsLinks || mainNavItemsBtns ) && isEnter) {
      distributeClasses(mainNavItemsLinks)
      distributeClasses(mainNavItemsBtns)
    } else if (mainNavItemsLinks || mainNavItemsBtns) {
      distributeClasses(mainNavItemsLinks)
      distributeClasses(mainNavItemsBtns)
    }
  }

  const handleTab = e => {
    const keyCode = e.keyCode || e.which;

    if (keyCode === 9 && !e.shiftKey && mobileNavOpen) {
      e.preventDefault()
      const firstLevelNavFirstItem = document.querySelector('.mobile-nav__menu a')

      if (firstLevelNavFirstItem) {
        firstLevelNavFirstItem.focus()
      } else {
        document.querySelector('.mobile-nav__submenu .previous-menu-button button').focus()
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (subMenuOpenRef.current) {
        setTimeout(() => {
          if (!e.target.closest('.header__nav') && !e.target.closest('.header-submenu__menu')) {
            closeSubmenu()
          }
        }, 100)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, []);

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted();	

  if (!hasMounted) {	
    return null	
  }

  return (
    <header className="header" ref={el => setHeaderEl(el)}>
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img src={Logo} alt="Human Tissue Authority Homepage" />
        </Link>
        
        <nav aria-label="header-nav" className="header__nav">
          <ul className="header__main-nav">
            {data.allMenuItems.nodes.map(menuItem => {
              if (menuItem.title === 'Home') {
                return (
                  <li
                    key={menuItem.id}
                    className={subMenuOpen ? 'inactive-parent-menu-item' : ''}
                  >
                    <Link
                      onMouseEnter={e => (navMouseHoverStateHandler(e, true), closeSubmenu())}
                      onMouseLeave={e => navMouseHoverStateHandler(e)}
                      to="/"
                    >
                      <span>Home</span>
                    </Link>
                  </li>
                )
              } else if (menuItem.title === 'Contact us') {
                return (
                  <li
                    key={menuItem.id}
                    className={subMenuOpen ? 'inactive-parent-menu-item' : ''}
                  >
                    <Link
                      onMouseEnter={e => (navMouseHoverStateHandler(e, true), closeSubmenu())}
                      onMouseLeave={e => navMouseHoverStateHandler(e)}
                      to="/make-an-enquiry"
                    >
                      <span>Contact us</span>
                    </Link>
                  </li>
                )
              } else {
                return (
                  <li
                    key={menuItem.id}
                    className={`link-button ${activeMenuItem === menuItem && subMenuOpen ? 'active-parent-menu-item' : subMenuOpen ? 'inactive-parent-menu-item' : ''}`}
                  >
                    <Link
                      activeClassName="link-active"
                      to={menuItem.url}
                      onClick={e => setActiveSubmenu(e, menuItem)}
                      onMouseEnter={e => (navMouseHoverStateHandler(e, true), setActiveSubmenu(e, menuItem))}
                      onMouseLeave={e => navMouseHoverStateHandler(e)}
                      partiallyActive
                      className="link-dropdown"
                    >
                      <span>{menuItem.title}</span>
                      <img src={ChevronDownWhite} alt="" />
                    </Link>
                  </li>
                )
              }
            })}
          </ul>
        </nav>
        
        <a href="https://portal.hta.gov.uk/" className="header__portal-link" target="_blank">
          Portal login
        </a>

        <button
          type="button"
          className="header__search-button"
          aria-label="Search"
          onClick={() => openSearch()}
        >
          <img src={SearchIcon} alt="Toggle search" />
        </button>

        <button
          className={`header__menu-button hamburger hamburger--slider ${mobileNavOpen ? 'is-active' : ''}`}
          type="button"
          aria-label="Menu"
          onClick={() => toggleMenu()}
          onKeyDown={e => handleTab(e)}
        >
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>

        {/* Tablet+ SubMenu */}
        <SubMenu
          data={activeMenuItem}
          open={subMenuOpen}
          menuChanging={menuChanging}
          setOpenMethod={setSubMenuOpen}
          setMenuChangingMethod={setMenuChanging}
        />
        
        <Search
          open={searchOpen}
          setOpenMethod={setSearchOpen}
        />

        {/* Mobile Navigation */}
        {mobileNavOpen && (
          <MobileNav
            open={mobileNavOpen}
            menuItems={[
              ...data.allMenuItems.nodes,
              {
              title: 'Portal login',
              url: 'https://portal.hta.gov.uk/',
              id: 'portal-login-id'
              }
            ]}
            subMenuOpen={mobileSubMenuOpen}
            setSubMenuOpenMethod={setMobileSubMenuOpen}
          />
        )}
      </div>
    </header>
  )
}

export default Header
