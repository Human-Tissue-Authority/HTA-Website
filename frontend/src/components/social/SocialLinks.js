import React, { useState, useEffect } from 'react'
import { animated, useTransition, config } from 'react-spring'

import linkedinImg from '../../images/linkedin.svg'
import twitterImg from '../../images/twitter.svg'
import youtubeImg from '../../images/youtube.svg'
import facebookImg from '../../images/facebook.svg'

import linkedinImgWhite from '../../images/linkedin--white.svg'
import twitterImgWhite from '../../images/twitter--white.svg'
import youtubeImgWhite from '../../images/youtube--white.svg'
import facebookImgWhite from '../../images/facebook--white.svg'

const links = [
  {
    img: linkedinImg,
    imgHover: linkedinImgWhite,
    link: 'https://www.linkedin.com/company/human-tissue-authority',
    type: 'linkedin'
  },
  {
    img: facebookImg,
    imgHover: facebookImgWhite,
    link: 'https://www.facebook.com/HumanTissueAuthority',
    type: 'facebook'
  },
  {
    img: twitterImg,
    imgHover: twitterImgWhite,
    link: 'https://twitter.com/HTA_UK',
    type: 'twitter'
  },
  {
    img: youtubeImg,
    imgHover: youtubeImgWhite,
    link: 'https://www.youtube.com/channel/UCMx0cFhYhXDMfbrIZ2jzVFA',
    type: 'youtube'
  }
]

const SocialLinks = () => {
  return (
    <div className="social__links">
      <h2>SOCIAL MEDIA</h2>
      <ul>
        {links && links.map(link => <SocialLink key={link.type} linkItem={link} />)}
    </ul>
    </div>
  )
}

const SocialLink = props => {
  const { linkItem } = props
  const [active, setActive] = useState(false)

  const animation = useTransition(active, null, {
    from: { position: 'absolute', opacity: 0 },
    config: config.stiff,
    unique: true,
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return (
    <li>
      <a
        className={linkItem.type}
        href={linkItem.link}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        {animation.map(({ item, key, props }) => item ?
          <animated.img key={key} style={props} src={linkItem.imgHover} alt={`${linkItem.type} social media icon`} /> :
          <animated.img key={key} style={props} src={linkItem.img} alt={`${linkItem.type} social media icon`} />
        )}
        <img src={linkItem.img} aria-hidden style={{ opacity: 0, visibility: 'hidden' }} alt="" />
      </a>
    </li>
  )
}

export default SocialLinks
