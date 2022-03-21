import React, { useEffect, useState } from "react"
import "../scss/main.scss"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./layout/header"
import Footer from "./layout/footer"
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

  return (
    <>
      <a className="skip-to-content-link" href="#main">
        Skip to content
      </a>
      <Header siteTitle={data.site.siteMetadata.title} />
      <div>
        <main id="main" className={classes || ''} style={{ minHeight }}>
          <noscript>
            <section className="govuk-phase-banner">
              <div className="govuk-phase-banner__content">
                <h2 className="govuk-tag govuk-tag--red govuk-phase-banner__content__tag">
                  JavaScript Disabled
                </h2>
                <span className="govuk-phase-banner__text">
                Our website works best with JavaScript enabled, some functionality may be unavailable to users with JavaScript disabled or those whose browsers do not support it.
                Find out more about enabling <a href="https://www.enable-javascript.com" target="_blank">JavaScript</a>.
                </span>
              </div>
            </section>
          </noscript>

          <GovBanner withSectionOverlay={withSectionOverlay} />
          <NotificationBanner />
          {children}
        </main>
      </div>

      {classes !== 'home' && typeof document !== 'undefined' && (
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
        This is a new service – <a className="govuk-link" target="_blank" href="https://www.surveymonkey.co.uk/r/MQ6WDXW">your feedback will help us to improve it</a>. Visit our <a href="https://archive.hta.gov.uk/" target="_blank">old website</a>.
        </span>
      </div>
    </section>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
