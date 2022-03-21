import React, { useState } from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import { animated, useTransition, config } from 'react-spring'

import Logo from "../../images/logo.svg"
import SearchIcon from "../../images/search.svg"
import CrossWhiteIcon from "../../images/cross-white.svg"
import MobileNav from "../navigation/mobileNav"
import SubMenu from "../navigation/subMenu"
import Search from "../navigation/search"

import ChevronDownWhite from '../../images/chevron-down--white.svg'

const Header = () => {
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuChanging, setMenuChanging] = useState(true)

  const closeSubmenu = () => {
    setSubMenuOpen(false)
    setMenuChanging(true)
  }

  const setActiveSubmenu = (e, parentMenuItem) => {
    if (e) e.preventDefault()

    // close search if open
    if (searchOpen) setSearchOpen(false)

    // close submenu
    if ((activeMenuItem && activeMenuItem === parentMenuItem) && subMenuOpen) {
      closeSubmenu()
    } else if (activeMenuItem && activeMenuItem !== parentMenuItem && subMenuOpen) {
      setMenuChanging(true)

      setTimeout(() => {
        setActiveMenuItem(parentMenuItem)
        setMenuChanging(false)
      }, 500)
    } else {
      setMenuChanging(false)
      setSubMenuOpen(true)
      setActiveMenuItem(parentMenuItem)
    }
  }

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false)
    } else {
      setSearchOpen(true)
      setSubMenuOpen(false)
      setMenuChanging(true)
    }
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

  // search toggle
  const searchToggleAnimation = useTransition(searchOpen, null, {
    from: { position: 'absolute', opacity: 0 },
    config: config.stiff,
    unique: true,
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img src={Logo} alt="Human Tissue Authority Homepage" />
        </Link>

        <nav aria-label="Main navigation" className="header__nav">
          <ul className="header__main-nav">
            {data.allMenuItems.nodes.map(menuItem => {
              if (menuItem.title === 'Home') {
                return (
                  <li
                    key={menuItem.id}
                    className={subMenuOpen ? 'inactive-parent-menu-item' : ''}
                  >
                    <Link
                      onMouseEnter={e => (navMouseHoverStateHandler(e, true))}
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
                      onMouseEnter={e => (navMouseHoverStateHandler(e, true))}
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
                      onMouseEnter={e => (navMouseHoverStateHandler(e, true))}
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

        <div className={`header__search-button-wrapper ${searchOpen ? 'header__search-button-wrapper--open' : '' }`}>
          <button
            type="button"
            className="header__search-button"
            aria-label="Search"
            onClick={() => toggleSearch()}
          >
            {searchToggleAnimation.map(({ item, key, props }) => item ?
              <animated.img key={key} style={props} src={CrossWhiteIcon} alt="Close search" /> :
              <animated.img key={key} style={props} src={SearchIcon} alt="Open search" />
            )}
          </button>
        </div>

        <button
          className={`header__menu-button hamburger hamburger--slider ${mobileNavOpen ? 'is-active' : ''}`}
          type="button"
          aria-label="Menu"
          onClick={() => toggleMenu()}
          onKeyDown={e => handleTab(e)}
        >
          <span className="hamburger-box">
          <label className="hamburger-inner">Menu</label>
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
