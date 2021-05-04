import React from 'react'
import { parseContent } from '../../../utils/utils'

const NumberedTextarea = props => {
  const { text, number} = props

  return (
    <div className="numbered-textarea-wrapper columns">
      <span className="textarea-number">{number}</span>
      <div className="column" dangerouslySetInnerHTML={{ __html: parseContent(text) }} />
    </div>
  )
}

export default NumberedTextarea
