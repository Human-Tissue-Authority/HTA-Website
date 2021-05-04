import React, { useEffect, useState } from 'react'
import { createPortal } from "react-dom"
import { window } from 'browser-monads'
import Cookies from 'js-cookie'
import { animated, useSpring, config } from 'react-spring'

import CrossWhite from '../../images/cross-white.svg'
import { fetchAuthed, parseContent } from '../../utils/utils'

const NotificationBanner = () => {
  const [bannerOpen, setBannerOpen] = useState(false)
  const [bannerDisabled, setBannerDisabled] = useState(true)

  // notification banner state
  const [bannerTitle, setBannerTitle] = useState(null)
  const [bannerMessage, setBannerMessage] = useState(null)
  const [bannerButtonText, setBannerButtonText] = useState(null)
  const [bannerSubmissionID, setBannerSubmissionID] = useState(null)

  const bannerExpandedAnimation = useSpring({
    config: config.stiff,
    from: { opacity: 0 },
    to: { opacity: bannerOpen && !bannerDisabled ? 1 : 0, pointerEvents: bannerOpen ? 'auto' : 'none' },
    delay: bannerOpen ? 200 : 0
  })

  const bannerDismissedAnimation = useSpring({
    config: config.stiff,
    from: { opacity: 0 },
    to: { opacity: !bannerOpen && !bannerDisabled ? 1 : 0, transform: !bannerOpen && !bannerDisabled ? 'translateY(0)' : 'translateY(20px)' },
    delay: bannerOpen ? 0 : 200
  })

  // check if cookie exists -> set cookie to banner dismissed
  // set banner open false
  const dismissBanner = () => {
    Cookies.set('notification_banner', { submission_id: bannerSubmissionID, banner_dismissed: true }, { expires: 7 })
    setBannerOpen(false)
  }

  // check if cookie exists -> set cookie banner open
  // set banner open true
  const openBanner = () => {
    Cookies.set('notification_banner', { submission_id: bannerSubmissionID, banner_dismissed: false }, { expires: 7 })
    setBannerOpen(true)
  }

  useEffect(() => {
    // fetch notification popup data
    fetchAuthed(process.env.API_ROOT + '/bbd_custom_rest_api/emergency-notice-banner')
      .then(res => {
        // check if a js-cookie already exists
        if (res) {
          const { notice_text, notice_title, open_button_text, path_exclusions, popup_enabled, submission_id } = res
          setBannerTitle(notice_title)
          setBannerMessage(notice_text.value)
          setBannerButtonText(open_button_text)
          setBannerSubmissionID(submission_id)

          // notification banner enabled
          if (popup_enabled === 1) {
            setBannerDisabled(false)

            const currentUrl = window.location.href

            // create new array of exclusion paths to include versions for both path with and without trailing slash
            const pathExclusionsArr = path_exclusions.split('\n').flatMap(path => {
              const pathTrimmed = path.trim()
              const pathLastCharacter = pathTrimmed.slice(-1)
              let pathWithTrailingSlash
              let pathWithoutTrailingSlash

              if (pathLastCharacter === '/') {
                pathWithTrailingSlash = path
                pathWithoutTrailingSlash = path.substring(0, path.length - 2)
              } else if (pathLastCharacter === '*') {
                pathWithTrailingSlash = path
                pathWithoutTrailingSlash = path
              } else {
                pathWithTrailingSlash = path + '/'
                pathWithoutTrailingSlash = path
              }

              return [pathWithTrailingSlash, pathWithoutTrailingSlash]
            })

            // check if current path is equal to an excluded path OR currentUrl contains any wildcard urls
            const isExcluded = pathExclusionsArr.filter(item => {
              if (item.slice(-1) === '*') {
                return currentUrl.includes(item.substring(0, item.length - 2))
              } else {
                return item === currentUrl
              }
            })

            if (isExcluded.length === 0) {
              const notification_cookie = Cookies.getJSON('notification_banner')
              
              // check if notification cookie exists
              // -> if it does, check if banner_dismissed is false or if the submission id has changed
              // -> show banner if either are true
              if (notification_cookie) {
                if (!notification_cookie?.banner_dismissed || notification_cookie?.submission_id !== submission_id) {
                  Cookies.set('notification_banner', { submission_id: bannerSubmissionID, banner_dismissed: false }, { expires: 7 })
                  setBannerOpen(true)
                  setBannerDisabled(false)
                }
              } else {
                Cookies.set('notification_banner', { submission_id: bannerSubmissionID, banner_dismissed: false }, { expires: 7 })
                setBannerOpen(true)
                setBannerDisabled(false)
              }
            } else {
              setBannerDisabled(true)
            }
          }
        }
      })
  }, [])

  return (
    <>
      {bannerOpen && (
        <animated.section
          style={bannerExpandedAnimation}
          className="notification-banner"
        >
          <div className="notification-banner__wrapper columns">
            <div className="column is-4">
              <h2 className="h notification-banner__title">
                {bannerTitle}
              </h2>
            </div>

            <div className="column is-7 is-offset-1">
              <div
                className="notification-banner__message"
                dangerouslySetInnerHTML={{ __html: parseContent(bannerMessage) }}
              />
            </div>
          </div>

          <button
            onClick={dismissBanner}
            type="button"
            className="notification-banner__close"
            aria-label="Close notification banner."
          >
            <img src={CrossWhite} aria-hidden role="presentation" alt="" />
          </button>
        </animated.section>
      )}
        
      
      {!bannerOpen && createPortal(
        <animated.div
          style={bannerDismissedAnimation}
          className="notification-banner notification-banner--dismissed"
        >
          <div className="notification-banner__wrapper">
            <button
              onClick={openBanner}
              type="button"
              className="column notification-banner__read-more"
              aria-label="Expand notification banner and read again"
            >
              {bannerButtonText}
            </button>
          </div>
        </animated.div>,
        document.body
      )}
    </>
  )
}

export default NotificationBanner
