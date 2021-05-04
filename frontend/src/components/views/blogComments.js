import React from "react"
import dayjs from "dayjs"
import AddComment from "../forms/addComment"
import { animated, useSpring, config } from "react-spring"

const BlogComments = ({ nid, comments = [] }) => {
  const animationComments = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
  })

  return (
    <animated.section className="comments" style={animationComments}>
      <div className="comments__list">
        <div className="columns is-multiline">

        {comments && comments.length > 1 ? (
            <h2 className="column is-full is-offset-1 comments__title h">Comments</h2>  
          ) : (
            <h2 className="column is-full is-offset-1 comments__title h">No comments</h2>
          )
        }
        
        <ul className="column is-offset-1">
          {comments && comments.map((comment, i) => (
            <li key={i}>
              <p className="comment-content">{comment.field_comment}</p>
              <p className="author">
                {comment.field_last_name},{" "}
                {dayjs(comment.created).format("D MMMM YYYY, HH:mm")}
              </p>
            </li>
            ))}
        </ul>
        </div>
      </div>
      <AddComment nid={nid} comments={comments} />
    </animated.section>
  )
}

export default BlogComments
