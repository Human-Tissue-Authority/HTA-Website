import React, { useState, useEffect, useRef } from 'react'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import { fetchEvents } from '../../utils/views'
import { getPaginationOffset } from '../../utils/utils'
import ContentListing from './contentListing'
import { useMediaQuery } from 'react-responsive'
import { graphql, useStaticQuery } from 'gatsby'
import DatePicker from '../misc/datePicker'
import dayjs from 'dayjs'

import TermsFilter from '../misc/termsFilter'
import FilterArrow from '../../images/filter-arrow.svg'
import ResetButton from '../misc/resetButton'

const ITEMS_PER_PAGE = 6

const ListingEvents = () => {
  // fetch filter terms
  const data = useStaticQuery(graphql`
    {
      audienceTerms: allTaxonomyTermAudience {
        nodes {
          id
          name
        }
      }
      tagsTerms: allTaxonomyTermTags {
        nodes {
          id
          name
        }
      }
    }
  `)

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

  const [audienceFilterOpen, setAudienceFilterOpen] = useState(false)
  const [audienceFilterVal, setAudienceFilterVal] = useState([])

  const [tagsFilterOpen, setTagsFilterOpen] = useState(false)
  const [tagsFilterVal, setTagsFilterVal] = useState([])

  //selected filter date
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(false)

  const [showPlaceholder, setShowPlaceholder] = useState(true)

  // close any open filters before opening new filter
  const expandFilter = (setMethod, openState) => {
    // if the filter already open just close it
    if (openState) {
      setMethod(false)
    } else {
      setAudienceFilterOpen(false)
      setTagsFilterOpen(false)
      setMethod(true)
    }
  }

  // reset filters
  const resetFilters = () => {
    navigate(baseUrl)

    const listingScrollPos = listingRef?.current?.offsetTop - 100

    window.scrollTo({
      top: listingScrollPos,
      behavior: 'smooth'
    })

    // close all filters
    setAudienceFilterOpen(false)
    setTagsFilterOpen(false)

    // reset all filter values
    setAudienceFilterVal([])
    setTagsFilterVal([])
  }


  const handleChangeDate = dates => {
    if (!Array.isArray(dates)) {
      setStartDate(dates)

    } else {
      if (dates) {
        const [start, end] = dates 
        if (dayjs(start).format('DD') === dayjs(end).format('DD')) return
        setShowPlaceholder(false)
        setStartDate(start)
        setEndDate(end)
      }
    }

    if (dates === null) {
      setShowPlaceholder(true)
      setStartDate(null)
      setEndDate(null)
    }
  }

  const handleClearDatePicker = () => {
    setShowPlaceholder(true)
    handleChangeDate(null)
  }

  const handleCalendarClose = () => {
    if (! !!endDate) {
      setStartDate(null)
    }
  };

  useEffect(() => {
    const currentUrl = window.location.href
    const urlParsed = parseUrl(currentUrl)

    // set base url
    if (urlParsed.url) setBaseUrl(urlParsed.url)

    // apply filters from url params on initial load
    if (currentUrl.includes('#')) {
      const urlParams = parse(currentUrl.split('#').pop())
      const { page, audience, tags, date } = urlParams

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }

      if (audience) setAudienceFilterVal(audience.split(','))
      if (tags) setTagsFilterVal(tags.split(','))

      if (date) {
        const datesParse = date.split('_').map(date => dayjs(date).toDate())
        handleChangeDate(datesParse)
      }
    }

    setReady(true)
  }, [])

  const getFromattedDate = () => {
    const formatDateRange = date => dayjs(date).format('YYYY-MM-DD')
    let dateParams
    let startDateFormat
    let endDateFormat

    if (startDate) {
      startDateFormat = formatDateRange(startDate)
      dateParams = startDateFormat
    }
    
    if (endDate) {
      endDateFormat = formatDateRange(endDate)
      dateParams = startDateFormat + '_' + endDateFormat
    }
    
    if ( startDateFormat === endDateFormat ) {
      dateParams = startDateFormat
    }

    return dateParams
  }

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const joinFilterValues = values => values.length > 0 ? values.join(',') : ''

    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      audience: joinFilterValues(audienceFilterVal),
      tags: joinFilterValues(tagsFilterVal),
      date: getFromattedDate()
    }, {
      skipEmptyString: true,
      skipNull: true,
      sort: false
    })

    const navigationUrl = stringifiedParams ? `${baseUrl}#?${stringifiedParams}` : baseUrl
    navigate(navigationUrl, { replace: true })
  }

  // filters functionality  
  const createFilterQuery = () => {
    let filterValue = '';

    if (audienceFilterVal.length > 0) {
      filterValue += `&fq=sm_audience:("${audienceFilterVal.join('" OR "')}")`
    }

    if (tagsFilterVal.length > 0) {
      filterValue += `&fq=sm_tags:("${tagsFilterVal.join('" OR "')}")`
    }

    if (startDate) {
      //get solr format with settable date / time
      const dateSolrFormat = (date, h = 0, m = 0, s = 0) => dayjs(date).hour(h).minute(m).second(s).format('YYYY-MM-DDTHH\\:mm\\:ss') + 'Z'

      const startDateParsed = dateSolrFormat(startDate, 0, 0, 0)
      let endDateParsed

      if (endDate) {
        endDateParsed = dateSolrFormat(endDate, 23, 59, 59)
      } else {
        endDateParsed = dateSolrFormat(startDate, 23, 59, 59)
      }

      filterValue += `&fq=ds_field_date:[${startDateParsed} TO ${endDateParsed}]`
    }
    
    if(!startDate) {
      filterValue += `&fq=ds_field_date:[NOW TO *]`
    }

    return filterValue
  }

  // data fetching functionality
  const requestResults = offsetVal => {
    setLoading(true)
    
    const filterQuery = createFilterQuery()
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

    fetchEvents({
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
            audience: doc.sm_audience,
            body: doc.tm_X3b_en_body,
            date: doc.ds_field_date,
            venue: doc.ss_field_venue,
            summary: doc.ss_summary,
            contact: [
              { name: doc.ss_field_contact_name },
              { phone: doc.ss_field_contact_telephone },
              { email: doc.ss_field_contact_email },
            ],
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
  }, [audienceFilterVal, tagsFilterVal, endDate])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      <div id="article-listing" className="listing listing-events" style={{ minHeight: listingHeight }}>
        <div className="listing-controls">
          {/* Filter expand toggles */}
          <div className="listing-controls__wrapper">
            <div className="listing-controls__filter">
              <button
                type="button"
                className={`listing-controls__filter-button ${audienceFilterOpen ? 'listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setAudienceFilterOpen, audienceFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Audience
              </button>

              {isMobile && audienceFilterOpen && <TermsFilter terms={data.audienceTerms.nodes} openState={audienceFilterOpen} filterVal={audienceFilterVal} setMethod={setAudienceFilterVal} /> }
            </div>

            <div className="listing-controls__filter">
              <button
                type="button"
                className={`listing-controls__filter-button ${tagsFilterOpen ? 'listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setTagsFilterOpen, tagsFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Tags
              </button>

              {isMobile && tagsFilterOpen && <TermsFilter terms={data.tagsTerms.nodes} openState={tagsFilterOpen} filterVal={tagsFilterVal} setMethod={setTagsFilterVal} /> }
            </div>

            <div className="listing-controls__filter">
              <DatePicker
                selected={startDate ? startDate : new Date()}
                onChange={handleChangeDate}
                startDate={startDate ? startDate : new Date()}
                endDate={endDate}
                placeholderText={'Select date'}
                showPlaceholder={showPlaceholder}
                onClearField={handleClearDatePicker}
                popperClassName={'date-picker__popper-styles'}
                popperPlacement={'bottom'}
                minDate={startDate ? startDate : new Date()}
                maxDate={startDate && endDate ? -1 : false}
                selectsRange={!!startDate}
                shouldCloseOnSelect={!!startDate}
                onCalendarClose={handleCalendarClose}
              />
            </div>

            <div className="listing-controls__reset">
              <ResetButton clickMethod={resetFilters} icon text="Reset filters" />
            </div>
          </div>

          {/* Filter inputs for tablet+ */}
          {!isMobile && (
            <>
              {audienceFilterOpen && (
                <TermsFilter
                  terms={data.audienceTerms.nodes}
                  openState={audienceFilterOpen}
                  filterVal={audienceFilterVal}
                  setMethod={setAudienceFilterVal}
                />
              )}

              {tagsFilterOpen && (
                <TermsFilter
                  terms={data.tagsTerms.nodes}
                  openState={tagsFilterOpen}
                  filterVal={tagsFilterVal}
                  setMethod={setTagsFilterVal}
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
            cardType="event"
            classes="article-listing-results"
            setListingHeight={setListingHeight}
            columns="12"
            columnsResponsive="12"
            noscriptMessage
          />
        )}
      </div>
    </>
  )
}

export default ListingEvents
