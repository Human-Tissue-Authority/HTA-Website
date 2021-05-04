import React from 'react'
import {graphql, Link, useStaticQuery} from 'gatsby'
import ArrowWhite from "../../images/arrow-white.svg"

const BigFooterNav = props => {

  const data = useStaticQuery(graphql`
    {
      allMenuItems(filter: {menu_name: {eq: "big-footer"}, parent: {id: {eq: null}}}, sort: {order: DESC, fields: weight}) {
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

  return (

    <nav aria-label="big-footer-nav" className="big__footer__nav">
      <ul>
        {data.allMenuItems.nodes.map(menuItem => (
          <NavItem
            key={menuItem.id}
            data={menuItem}
          >
            <SubMenu data={menuItem.children} />
          </NavItem>
        ))}
      </ul>
    </nav>
  )
}

const NavItem = ({ data, children }) => (
  <li>
    <Link
      to={data.url || '/'}
    >
      <img src={ArrowWhite} role="presentation" alt="" />
      <span>{data.title}</span>
    </Link>

    {children}
  </li>
)

const SubMenu = ({ data }) => {
  return (
    <ul className="submenu">
      {data.map(menuItem => (
        <NavItem
          key={menuItem.id}
          data={menuItem}
        />
      ))}
    </ul>
  )
}

export default BigFooterNav
