import React, { useEffect, useState } from "react"
import "../scss/main.scss"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./layout/header"
import Footer from "./layout/footer"
import { useHasMounted } from "../utils/hooks"
import NotificationBanner from "./misc/notificationBanner"
import RateThisPage from "./forms/rateThisPage"

const Layout = ({ classes, children, forceSearchOpen, withSectionOverlay }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const [minHeight, setMinHeight] = useState('100vh')
  const [pageUrl, setPageUrl] = useState(null)

  useEffect(() => {
    // get current page url
    const currentUrl = window.location.href
    setPageUrl(currentUrl)
    
    // set page min height once sidebar height is finalised
    let counter = 0

    const checkExist = setInterval(function() {
      const overlay = document.querySelector('.section--overlay')
      counter++

      if (overlay || counter === 100) {
        if (overlay) {
          setMinHeight(`${overlay.clientHeight + 150}px`)
        }
        clearInterval(checkExist);
      }
    }, 100);
  }, [])

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted();	

  if (!hasMounted) {	
    return null	
  }
  
  return (
    <>
      <a className="skip-to-content-link" href="#main">
        Skip to content
      </a>
      <Header siteTitle={data.site.siteMetadata.title} forceSearchOpen={forceSearchOpen} />
      <div>
        <main id="main" className={classes || ''} style={{ minHeight }}>
          <GovBanner withSectionOverlay={withSectionOverlay}/>
          <NotificationBanner />
          {children}
        </main>
      </div>

      {classes !== 'home' && (
        <RateThisPage page={pageUrl} />
      )}

      <Footer/>
    </>
  )
}

const GovBanner = ({withSectionOverlay}) => {
  return (
    <section className={`govuk-phase-banner${withSectionOverlay ? '' : ' full-width'}`}>
      <div className="govuk-phase-banner__content">
        <h2 className="govuk-tag govuk-phase-banner__content__tag">
          beta
        </h2>
        <span className="govuk-phase-banner__text">
          This is a new service – your <a className="govuk-link" target="_blank" href="https://www.surveymonkey.co.uk/r/BSCLGLJ">feedback</a> will help us to improve it.
        </span>
      </div>
    </section>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
