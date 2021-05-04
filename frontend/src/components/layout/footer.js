import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import SocialLinks from "../social/SocialLinks"
import TwitterFeed from "../social/TwitterFeed"
import MailchimpSignup from "../social/MailchimpSignup"
import BigFooterNav from "../navigation/BigFooterNav"

const Footer = () => {
  const data = useStaticQuery(graphql`
    {
      allMenuItems(filter: {menu_name: {eq: "footer"}}, sort: {order: DESC, fields: weight}) {
        nodes {
          title
          url
          id
        }
      }
    }
  `)

  return (
    <footer className="footer">
      <div className="footer__wrapper columns is-multiline">
        <h3 className="visuallyhidden">Footer</h3>
        <div className="footer__section">
          <MailchimpSignup/>
          <SocialLinks/>
        </div>
        {/* 
          * Temporarily disable twitter feed
          *  
        <div className="footer__section">
          <TwitterFeed/>
        </div> */}

        <div className="footer__section">
          <BigFooterNav/>
        </div>

        <div className="footer__section">
          <nav aria-label="footer-nav" className="footer__nav">
            <ul>
              {data.allMenuItems.nodes.map(menuItem => (
                <li key={menuItem.id}>
                  <Link to={menuItem.url || '/'}>
                    {menuItem.title}
                  </Link>
                </li>
              ))}
              {/* Temporarily disable cookies link
              <li>
                <Link className="optanon-show-settings"
                  to={'#'}
                >
                  Cookie Settings
                </Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer
