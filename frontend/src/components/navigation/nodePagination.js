import React, { useState } from 'react'
import { Link } from "gatsby"
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import ParagraphWrapper from '../paragraphs/paragraphWrapper'

dayjs.extend(isSameOrAfter)

const NodePagination = props => {
  const { prevNode, nextNode, comparisonField } = props
  const [show, setShow] = useState(false)

  const currentDate = dayjs()
  const prevNodeDateCompared = prevNode && prevNode[comparisonField] ? dayjs(prevNode[comparisonField]).isSameOrAfter(currentDate) : null
  const nextNodeDateComapred = nextNode && nextNode[comparisonField] ? dayjs(nextNode[comparisonField]).isSameOrAfter(currentDate) : null

  return (
    <>
      {
        (((prevNode && prevNodeDateCompared) || (nextNode && nextNodeDateComapred)) ||
        (!comparisonField && (prevNode || nextNode))) &&
      (
        <ParagraphWrapper
          show={show}
          setShow={setShow}
          animationStyle="fadeInFromBottom"
          classes="node-pagination"
        >
          <div className="node-pagination__wrapper columns is-mobile">
            <div className="node-pagination__control node-pagination__control--prev column is-6-mobile is-5-tablet is-offset-1-tablet">
              {((prevNode && prevNodeDateCompared) || (prevNode && !comparisonField)) && (
                <div className="node-pagination__control-wrapper columns is-multiline">
                  <p className="node-pagination__title column is-12-mobile is-8">Previous</p>
                  <Link className="column is-12-mobile is-8" to={prevNode.path.alias}>
                    {prevNode.title}
                  </Link>
                </div>
              )}
            </div>

            <div className="node-pagination__control node-pagination__control--next column is-6-mobile is-5-tablet">
              {((nextNode && nextNodeDateComapred) || (nextNode && !comparisonField)) && (
                <div className="node-pagination__control-wrapper columns is-multiline">
                  <p className="node-pagination__title column is-12-mobile is-8 is-offset-1">Next</p>
                  <Link className="column is-12-mobile is-8 is-offset-1" to={nextNode.path.alias}>
                    {nextNode.title}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </ParagraphWrapper>
      )}
    </>
  )
}

export default NodePagination
