import React from 'react'
import {graphql, Link, useStaticQuery} from 'gatsby'
import dayjs from 'dayjs'
import ArrowWhite from '../../images/arrow-white.svg'

const TwitterFeed = () => {
  const data = useStaticQuery(graphql`
    {
      allNodeTweet(limit: 3, sort: {order: DESC, fields: created}) {
        nodes {
          field_tweet_content {
            value
          }
          created
        }
      }
    }
  `)

  // get tweets
  const tweets = data.allNodeTweet.nodes

  return (
    <section className="twitter__feed">
      <h2>
        <img src={ArrowWhite} role="presentation" alt="" />
        <Link to='https://twitter.com/HTA_UK' target="_blank">@HTA_UK on twitter </Link>
      </h2>
        <ul className="twitter__items">
          {tweets.map(tweet => (
            <RenderTweet
              data={tweet}
              key={tweet.id}
            />
          ))}
        </ul>
    </section>
  )
}

const RenderTweet = ({ data }) => (
  <li>
    <div
      className="tweet__content"
      dangerouslySetInnerHTML={{
        __html: data.field_tweet_content.value,
      }}
    />
    <span className="tweet__date">{
      dayjs(data.created).format(
        'HH:mm D MMM, YYYY'
      )}</span>
  </li>
)

export default TwitterFeed
