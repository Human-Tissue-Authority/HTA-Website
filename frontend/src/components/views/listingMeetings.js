import React, { useState, useEffect, useRef } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import dayjs from 'dayjs'
import { useMediaQuery } from 'react-responsive'

import { fetchMeetings } from '../../utils/views'
import { getPaginationOffset } from '../../utils/utils'

import ContentListing from './contentListing'
import ResetButton from '../misc/resetButton'
import FilterArrow from '../../images/filter-arrow.svg'
import TermsFilter from '../misc/termsFilter'

const ITEMS_PER_PAGE = 20

const DATE_OPTIONS = [
  { id: 'upcoming-meetings', name: 'Upcoming meetings' },
  { id: 'previous-meetings', name: 'Previous meetings' },
]

const ListingMeetings = ({ displayPrevious }) => {
  // fetch filter terms
  const data = useStaticQuery(graphql`
    {
      familyTerms: allTaxonomyTermFamily {
        nodes {
          id
          name
        }
      }
    }
  `)

  const familyOptions = data.familyTerms.nodes.map(term => {
    return { id: term.id, name: term.name }
  });

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
  const [typeFilterOpen, setTypeFilterOpen] = useState(false)
  const [typeFilterVal, setTypeFilterVal] = useState([])

  const [dateFilterOpen, setDateFilterOpen] = useState(false)
  const [dateFilterVal, setDateFilterVal] = useState([])

  useEffect(() => {
    const currentUrl = window.location.href
    const urlParsed = parseUrl(currentUrl)

    // set base url
    if (urlParsed.url) setBaseUrl(urlParsed.url)

    // apply filters from url params on initial load
    if (currentUrl.includes('#')) {
      const urlParams = parse(currentUrl.split('#').pop())
      const { page, type, date } = urlParams

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }

      if (type) setTypeFilterVal(type.split(','))
      if (date) setDateFilterVal(date.split(','))
    }

    setReady(true)
  }, [])

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      type: typeFilterVal.length > 0 ? typeFilterVal.join(',') : '',
      date: dateFilterVal.length > 0 ? dateFilterVal.join(',') : ''
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
      setTypeFilterOpen(false)
      setDateFilterOpen(false)
      setMethod(true)
    }
  }

  const createFilterQuery = () => {
    let filterValue = '';

    if (typeFilterVal.length > 0) {
      filterValue += `&fq=tm_X3b_en_family_tag:("${typeFilterVal.join('" OR "')}")`
    }

    const currentTimestamp = dayjs().format('YYYY[-]MM[-]DD[T]HH:mm:ss[Z]')

    if (dateFilterVal.includes('Upcoming meetings') && !dateFilterVal.includes('Previous meetings')) {
      filterValue += `&fq=ds_field_date:[${currentTimestamp} TO *]&sort=ds_field_date%20asc`
    } else if (!dateFilterVal.includes('Upcoming meetings') && dateFilterVal.includes('Previous meetings')) {
      filterValue += `&fq=ds_field_date:[* TO ${currentTimestamp}]&sort=ds_field_date%20desc`
    }

    return filterValue
  }

  // data fetching functionality
  const requestResults = offsetVal => {
    setLoading(true)
    
    const filterQuery = createFilterQuery()
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

    fetchMeetings({
      itemsPerPage: ITEMS_PER_PAGE,
      offset: requestOffset,
      queryFilters: filterQuery
    })
    .then(res => {
      if (res.response) {
        setOffset(requestOffset)
        setTotal(res.response.numFound)

        // format results
        const formattedResults = res.response.docs.map(doc => {
          return {
            id: doc.its_nid,
            title: doc.ss_title,
            link: doc.ss_url_alias,
            timestamp: doc.ds_field_date,
            family: doc.tm_X3b_en_family_tag
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

    setTypeFilterVal([])
    setDateFilterVal([])
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
  }, [typeFilterVal, dateFilterVal])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      <section id="meeting-listing" className="meeting-listing" style={{ minHeight: listingHeight }}>
        <div className="meeting-listing-controls">
          {/* Filter expand toggles */}
          <div className="meeting-listing-controls__wrapper">
            <div className="meeting-listing-controls__filter">
              <button
                type="button"
                className={`meeting-listing-controls__filter-button ${typeFilterOpen ? 'meeting-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setTypeFilterOpen, typeFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Meeting/working group
              </button>

              {isMobile && typeFilterOpen && (
                <TermsFilter
                  terms={familyOptions}
                  openState={typeFilterOpen}
                  filterVal={typeFilterVal}
                  setMethod={setTypeFilterVal}
                />
              )}
            </div>

            <div className="meeting-listing-controls__filter">
              <button
                type="button"
                className={`meeting-listing-controls__filter-button ${dateFilterOpen ? 'meeting-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setDateFilterOpen, dateFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Date
              </button>

              {isMobile && dateFilterOpen && (
                <TermsFilter
                  terms={DATE_OPTIONS}
                  openState={dateFilterOpen}
                  filterVal={dateFilterVal}
                  setMethod={setDateFilterVal}
                />
              )}
            </div>

            <div className="meeting-listing-controls__reset">
              <ResetButton clickMethod={resetFilters} icon text="Reset filters" />
            </div>
          </div>

          {/* Filter inputs for tablet+ */}
          {!isMobile && (
            <>
              {typeFilterOpen && (
                <TermsFilter
                  terms={familyOptions}
                  openState={typeFilterOpen}
                  filterVal={typeFilterVal}
                  setMethod={setTypeFilterVal}
                />
              )}

              {dateFilterOpen && (
                <TermsFilter
                  terms={DATE_OPTIONS}
                  openState={dateFilterOpen}
                  filterVal={dateFilterVal}
                  setMethod={setDateFilterVal}
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
            cardType="meeting"
            classes="meeting-results"
            setListingHeight={setListingHeight}
            columns="12"
            columnsResponsive="12"
            noscriptMessage
          />
        )}
      </section>
    </>
  )
}

export default ListingMeetings
