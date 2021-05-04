import React, { useState } from 'react'
import ReactPaginate from 'react-paginate'
import { animated, useTransition, config } from 'react-spring'

import ArrowWhite from '../../images/arrow-white.svg'
import ArrowPurple from '../../images/arrow-purple.svg'

const Pagination = props => {
  const { itemsPerPage, totalItems, handlePagination, forcePage } = props
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const previousComp = <PaginationButton direction="prev" />
  const nextComp = <PaginationButton direction="next" />

  return (
    <nav className="pagination-wrapper column is-12" aria-label={`Pagination ${totalItems}`}>
      <ReactPaginate
        pageCount={pageCount}
        pageRangeDisplayed={8}
        marginPagesDisplayed={1}
        previousLabel={previousComp}
        nextLabel={nextComp}
        containerClassName="pagination"
        pageClassName="pagination__item pagination__item--page"
        pageLinkClassName="pagination__link"
        nextClassName="pagination__item pagination__item--next"
        nextLinkClassName="pagination__link"
        previousClassName="pagination__item pagination__item--prev"
        previousLinkClassName="pagination__link"
        activeClassName="pagination__item--active"
        onPageChange={handlePagination}
        forcePage={forcePage}
      />
    </nav>
  )
}

export default Pagination

const PaginationButton = props => {
  const { direction } = props
  const [active, setActive] = useState(false)

  const animation = useTransition(active, null, {
    from: { opacity: 0 },
    config: config.stiff,
    unique: true,
    enter: { opacity: 1 },
    leave: { opacity: 0, position: 'absolute' },
  })

  return (
    <div
      className={`pagination-button-icon pagination-button-icon--${direction}`}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
    >
      {animation.map(({ item, key, props }) => item ?
        <animated.img key={key} style={props} src={ArrowWhite} aria-hidden role="presentation" alt="" /> :
        <animated.img key={key} style={props} src={ArrowPurple} aria-hidden role="presentation" alt="" />
      )}
    </div>
  )
}
