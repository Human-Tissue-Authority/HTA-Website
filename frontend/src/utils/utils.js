import React from 'react'
import { encode } from 'js-base64'
import { document } from 'browser-monads'
import FollowBlog from "../components/forms/followBlog"

/**
 * @desc converts raw html into markup that can be dangerously inserted
 * @param {string} html - the html to be converted
 * @return object - the parse html markup object
 */
export function createMarkup(html) {
  return {
    __html: parseContent(html)
  };
}

export function stripHTML(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  const text = div.textContent || div.innerText || ''

  return text
}

export function cleanString(str) {
  if (str.length > 0) return str.trim().replace(/ +(?= )/g, '')
}

export function truncateToNearestWord(str, maxLength, separator = ' ') {
  if (str.length <= maxLength) return str

  return str.substr(0, str.lastIndexOf(separator, maxLength)) + '...'
}

export function auth() {
  const user = process.env.AUTH_USER
  const pass = process.env.AUTH_PASS
  const options = {}

  if (process.env.NODE_ENV === 'production' && user && pass && user.length && pass.length) {
    const authstring = encode(
      `${process.env.AUTH_USER}:${process.env.AUTH_PASS}`
    )

    options.credentials = 'include'
    options.headers = {
      Authorization: `Basic ${authstring}`
    }
  }

  return options
}

export async function fetchAuthed(endpoint) {
  const options = auth()
  const fetched = await fetch(endpoint, options).then(res => res.json()).catch(err => console.log({ err }))

  return fetched
}

export function verifyRecaptcha(recaptchaValue) {
  if (recaptchaValue) {
    const options = auth();

    if (options.headers) {
      options.headers['Content-Type'] = 'application/json'
      options.headers.Accept = 'text/plain'
    } else {
      options.headers = {
        'Content-Type': 'application/json',
        Accept: 'text/plain'
      }
    }

    options.method = 'POST'
    options.body = JSON.stringify({
      captcha_response: recaptchaValue
    })

    return fetch(`${process.env.API_ROOT}/bbd_custom_rest_api/check-recaptcha-response`, options)
      .then(res => res.json())
      .catch(e => {
        return {
          success: false,
          'error-codes': ['request-failed', `${e?.error}`]
        }
      })
  } else {
    return {
      success: false,
      'error-codes': ['no-recaptcha-value']
    }
  }
}

export function getPaginationOffset(pageNumber, itemsPerPage) {
  const paginationOffset = (pageNumber - 1) * itemsPerPage

  return paginationOffset
}

export function determineInThisSectionData(type, allParentAndParentPeers, allChildren, allPeers, allParentAndChildPagesAndPeers, manual, sectionOverlayRef) {
  switch (type) {
    case `Parent & parent's peers`: 
      return allParentAndParentPeers
    case `All child pages`:
      return allChildren
    case `All peers`:
      return allPeers
    case `Parent, child pages & peers`:
      return allParentAndChildPagesAndPeers
    case `"Follow the blog" form`:
      return {
        component: <FollowBlog column={12} showBackButton={false} ref={sectionOverlayRef}/>
      }
    case `Manual`:
      return {
        nodes: manual
      }
    default:
      return null
  }
}

export function contactDataAsLink(contactObj, contacts = [], index) {
  if (!contactObj) return

  const currentValue = Object.values(contactObj)[0]
  if (!currentValue) return

  const contactsValues = contacts && contacts.map(contact => Object.values(contact)[0]).filter(val => val)
  let comma;
  const elIndex = contactsValues.indexOf(currentValue)
  if (contactsValues[elIndex + 1]) {
    comma = ','
  }
  if ('phone' in contactObj) return <span key={index} className='small-content inline-flex'><a className="small-content" href={`callto:${contactObj.phone}`}>{contactObj.phone}</a>{comma}&#160;</span>
  if ('email' in contactObj) return <span key={index} className='small-content inline-flex'><a className="small-content" href={`mailto:${contactObj.email}`}>{contactObj.email}</a>{comma}</span>
  return <span key={index} className="small-content">{Object.values(contactObj)[0]}{comma}&#160;</span>
} 

export function parseContent(html) {
  let htmlString = html ?? '';
  const template = document.createElement('template');

  if (html && html.length > 0 && Object.isExtensible(template)) {
    template.innerHTML = html.trim()
    const htmlMounted = template.content
  
    // parse tables - wraps tables in div elements
    htmlMounted.querySelectorAll('table').forEach(function(table) {
      const wrapper = document.createElement('div')
      wrapper.setAttribute('class', 'table-outer-wrapper')
      wrapper.setAttribute('tabindex', '0')
      wrapper.setAttribute('aria-label', 'table')
      table.parentNode.insertBefore(wrapper,table);
      wrapper.appendChild(table);
    });
  
    // parse images - modify inline image path to include full path url
    htmlMounted.querySelectorAll('img').forEach(function(img) {
      const imgSrc = img.getAttribute('src')
  
      if (!imgSrc.includes('://') || !imgSrc.includes('http')) {
        img.setAttribute('src', process.env.CMS_ROOT + imgSrc)
      }
    })
  
    // parse mounted html back into string
    const container = document.createElement('div')
    container.appendChild(htmlMounted)
    htmlString = container.innerHTML
  }

  return htmlString
}
