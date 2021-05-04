import React, { useState, useEffect, useRef } from 'react'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import { fetchEvents } from '../../utils/views'
import { getPaginationOffset } from '../../utils/utils'
import ContentListing from './contentListing'
import Select from 'react-select'
import { graphql, useStaticQuery } from 'gatsby'
import DatePicker from '../misc/datePicker'
import dayjs from 'dayjs'

const ITEMS_PER_PAGE = 6

const ListingEvents = () => {
  // fetch filter terms
  const data = useStaticQuery(graphql`
    {
      allTaxonomyTermAudience: allTaxonomyTermAudience {
        nodes {
          id
          name
        }
      }
      allTaxonomyTermTags: allTaxonomyTermTags {
        nodes {
          id
          name
        }
      }
    }
  `)

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

  //list of categories - audience
  const [audienceList, setAudienceList] = useState([])
  //list of tags
  const [tagsList, setTagsList] = useState([])

  //selected filter audience
  const [selectedAudience, setSelectedAudience] = useState([])
  //selected filter tags
  const [selectedTags, setSelectedTags] = useState([])
  //selected filter date
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(false)

  const [showPlaceholder, setShowPlaceholder] = useState(true)

  const handleChangeAudience = audience => setSelectedAudience(audience)
  const handleChangeTags = tags => setSelectedTags(tags)
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
    const audienceNames = data.allTaxonomyTermAudience.nodes.map(term => term.name)
    const tagNames = data.allTaxonomyTermTags.nodes.map(term => term.name)

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

      if (audience) {
        const audienceSlugs = audience.split(',')
        setSelectedAudience(parseOptions(audienceSlugs, 'toLabel'))
      }

      if (tags) {
        const tagsSlugs = tags.split(',')
        setSelectedTags(parseOptions(tagsSlugs, 'toLabel'))
      }

      if (date) {
        const datesParse = date.split('_').map(date => dayjs(date).toDate())
        handleChangeDate(datesParse)
      }
    }
    setAudienceList(parseOptions(audienceNames, 'toSlug'))
    setTagsList(parseOptions(tagNames, 'toSlug'))
    setReady(true)
  }, [])

  const parseOptions = (data, parseType) => data.map(item => {
    //get select input object with parsed label or slug
    let value
    let label
    if (parseType ==='toLabel') {
      label = item.replace(/[_]/g, ' ').split('')
      label[0] = label[0].toUpperCase()
      label = label.join('')
      value = item
    }
    if (parseType === 'toSlug') {
      value = item.toLowerCase()
      label = item
    }
    return {
      value,
      label
    }
  })

  const getFromattedData = () => {
    const formatDateRange = date => dayjs(date).format('YYYY-MM-DD')
    const getSlugStrings = data => data && data.length > 0 ? data.map(item => item.value).join() : ''
    //get parsed params from state
    const selectedAudienceParams = getSlugStrings(selectedAudience)
    const selectedTagsParams = getSlugStrings(selectedTags)
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

    return {
      audienceParams: selectedAudienceParams,
      tagsParams: selectedTagsParams,
      dateParams
    }
  }

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const {audienceParams, tagsParams, dateParams} = getFromattedData()

    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      audience: audienceParams,
      tags: tagsParams,
      date: dateParams
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
    const getSolrNames = param => param.map(cat => `"${cat.label}"`).join(' ')
    let filterValue = '';

    if (selectedAudience && selectedAudience.length > 0) {
      const audienceParsed = getSolrNames(selectedAudience)
      filterValue += `&fq=sm_audience:(${audienceParsed})`
    }

    if (selectedTags && selectedTags.length > 0) {
      const tagsParsed = getSolrNames(selectedTags)
      filterValue += `&fq=sm_tags:(${tagsParsed})`
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
            tags: doc.sm_tags,
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
  }, [selectedAudience, selectedTags, endDate])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      <div id="article-listing" className="article-listing" style={{ minHeight: listingHeight }}>
        <div className="article-listing-controls">
          <div className="article-listing-controls__wrapper">
            <div className="article-listing-controls__filter article-listing-controls__filter--search">
              <div
                className={`article-listing-controls__filter-button`}
              >
                <Select
                  options={audienceList}
                  className="article-listing-filter"
                  classNamePrefix="article-listing-filter"
                  placeholder="Audience"
                  aria-label="Select Audience"
                  autoFocus={true}
                  onChange={handleChangeAudience}
                  isSearchable={false}
                  value={selectedAudience}
                  isMulti
                />

                <Select
                  options={tagsList}
                  className="article-listing-filter small-filter"
                  classNamePrefix="article-listing-filter"
                  placeholder="Tags"
                  aria-label="Select tags"
                  autoFocus={true}
                  onChange={handleChangeTags}
                  isSearchable={false}
                  value={selectedTags}
                  isMulti
                />
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
            </div>
          </div>
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
          />
        )}
      </div>
    </>
  )
}

export default ListingEvents
