import React, { useState, useEffect, useRef } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import dayjs from 'dayjs'
import { useMediaQuery } from 'react-responsive'

import { fetchNews } from '../../utils/views'
import { getPaginationOffset } from '../../utils/utils'

import ContentListing from './contentListing'
import ResetButton from '../misc/resetButton'
import FilterArrow from '../../images/filter-arrow.svg'
import TermsFilter from '../misc/termsFilter'


const ITEMS_PER_PAGE = 16

const ListingNews = () => {
  // const yearsList = Array((dayjs().year() - 2014)).map((val, i, arr) => arr.fill(2014 + i, i))
  const yearsOptions = Array.from({length: (dayjs().year() + 1)  - 2014}, (element, i) => dayjs().year() - i).map(val => {
    return {
      id: val.toString(), 
      name: val.toString()
    }
  })

  const isMobile = useMediaQuery({ query: '(max-width: 767px)' })
  
  // listing state
  const [baseUrl, setBaseUrl] = useState(null)
  const [initialLoad, setInitialLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [listingHeight, setListingHeight] = useState('auto')
  const listingRef = useRef(null)

  // filters state
  const [yearFilterOpen, setYearFilterOpen] = useState(false)
  const [yearFilterVal, setYearFilterVal] = useState([])

  useEffect(() => {
    const currentUrl = window.location.href
    const urlParsed = parseUrl(currentUrl)

    // set base url
    if (urlParsed.url) setBaseUrl(urlParsed.url)

    // apply filters from url params on initial load
    if (currentUrl.includes('#')) {
      const urlParams = parse(currentUrl.split('#').pop())
      const { page, year } = urlParams

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }

      if (year) setYearFilterVal(year.split(','))
    }

    setReady(true)
  }, [])

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      year: yearFilterVal.length > 0 ? yearFilterVal.join(',') : ''
    }, {
      skipEmptyString: true,
      skipNull: true,
      sort: false
    })

    const navigationUrl = stringifiedParams ? `${baseUrl}#?${stringifiedParams}` : baseUrl
    navigate(navigationUrl, { replace: true })
  }

  const expandFilter = (setMethod, openState) => {
    // close any open filters before opening new filter

    // if the filter already open just close it
    if (openState) {
      setMethod(false)
    } else {
      setYearFilterOpen(false)
      setMethod(true)
    }
  }

  // filters functionality  
  const createFilterQuery = () => {
    const dateSolrFormat = date => date.format('YYYY-MM-DDTHH\\:mm\\:ss') + 'Z'
    let filterValue = '';

    if (yearFilterVal.length > 0) {      
      const dateRangeQueries = yearFilterVal.map(y => `[${dateSolrFormat(dayjs(y).startOf('year').startOf('day').startOf('month'))} TO ${dateSolrFormat(dayjs(y).endOf('year').endOf('day').endOf('month'))}]`)

      dateRangeQueries.map((date, i) => {
        const isMoreDatesThanOne = i > 0

        if (isMoreDatesThanOne) {
          filterValue += ` OR ds_field_date:${date}`
        } else {
          filterValue += `&fq=ds_field_date:${date}`
        }
      })

    }

    return filterValue
  }

  // data fetching functionality
  const requestResults = offsetVal => {
    setLoading(true)
    
    const filterQuery = createFilterQuery()
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

    fetchNews({
      itemsPerPage: ITEMS_PER_PAGE,
      offset: requestOffset,
      queryFilters: filterQuery
    })
    .then(res => {
      if (res.response) {
        setOffset(requestOffset)
        setTotal(res.response.numFound)
        // format results, get results with ID
        const formattedResults = res.response.docs.filter(doc => doc.its_nid).map(doc => {
          return {
            id: doc.its_nid,
            title: doc.ss_title,
            link: doc.ss_alias,
            sector: doc.sm_sector_tags,
            audience: doc.sm_audience,
            body: doc.tm_X3b_en_body,
            date: doc.ds_field_date,
            summary: doc.ss_summary
          }
        })

        setResults(formattedResults)
        setLoading(false)
      }
    })
    .catch(error => console.log({ error }))
  }

  // handle pagination
  const handlePagination = async paginationData => {
    const { selected } = paginationData
    const offsetVal = Math.ceil(selected * ITEMS_PER_PAGE)

    setOffset(offsetVal)
    setCurrentPage(selected)

    requestResults(offsetVal)
    await silentlyPushUrlParams(selected)

    const listingScrollPos = listingRef?.current?.offsetTop - 100

    window.scrollTo({
      top: listingScrollPos,
      behavior: 'smooth'
    })
  }

  const resetFilters = () => {
    navigate(baseUrl)

    const listingScrollPos = listingRef?.current?.offsetTop - 100

    window.scrollTo({
      top: listingScrollPos,
      behavior: 'smooth'
    })

    setYearFilterVal([])
  }

  // initial request
  useEffect(() => {
    if (ready) {
      requestResults()
      setInitialLoad(true)
    }
  }, [ready])

  // execute new request whenever sort changes or filters change
  useEffect(() => {
    if (initialLoad) {
      setCurrentPage(0)
      requestResults(0)
      silentlyPushUrlParams(0)
    }
  }, [yearFilterVal])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointernewss: 'none' }} />
      <div id="article-listing" className="article-listing" style={{ minHeight: listingHeight }}>
      <div className="article-listing-controls">
          {/* Filter expand toggles */}
          <div className="article-listing-controls__wrapper">

            <div className="article-listing-controls__filter">
              <button
                type="button"
                className={`article-listing-controls__filter-button ${yearFilterOpen ? 'article-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setYearFilterOpen, yearFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Filter by year
              </button>

              {isMobile && yearFilterOpen && (
                <TermsFilter
                  terms={yearsOptions}
                  openState={yearFilterOpen}
                  filterVal={yearFilterVal}
                  setMethod={setYearFilterVal}
                />
              )}
            </div>

            <div className="article-listing-controls__reset">
              <ResetButton clickMethod={resetFilters} icon text="Reset filters" />
            </div>
          </div>

          {/* Filter inputs for tablet+ */}
          {!isMobile && (
            <>
              {yearFilterOpen && (
                <TermsFilter
                  terms={yearsOptions}
                  openState={yearFilterOpen}
                  filterVal={yearFilterVal}
                  setMethod={setYearFilterVal}
                />
              )}
            </>
          )}
        </div>

        {results && !loading && (
          <ContentListing
            items={results}
            total={total}
            itemsPerPage={ITEMS_PER_PAGE}
            handlePagination={handlePagination}
            offset={offset}
            loading={loading}
            currentPage={currentPage}
            cardType="news"
            classes="news-listing-results"
            setListingHeight={setListingHeight}
            columns="4"
            columnsResponsive="12"
            noscriptMessage
          />
        )}
      </div>
    </>
  )
}

export default ListingNews
