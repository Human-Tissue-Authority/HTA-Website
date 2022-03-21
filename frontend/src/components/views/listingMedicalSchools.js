import React, { useState, useEffect, useRef } from 'react'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import { useMediaQuery } from 'react-responsive'

import { fetchMedicalSchools } from '../../utils/views'
import { cleanString, getPaginationOffset } from '../../utils/utils'

import ContentListingTable from './contentListingTable'
import ResetButton from '../misc/resetButton'

import SortToggleArrows from '../../images/sort-toggle.svg'
import FilterArrow from '../../images/filter-arrow.svg'
import SearchFilter from '../misc/searchFilter'

const ITEMS_PER_PAGE = 20

const ListingMedicalSchools = () => {
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
  const [sortBy, setSortBy] = useState('name-asc')
  const [listingHeight, setListingHeight] = useState('auto')
  const listingRef = useRef(null)

  // filters state
  const [searchFilterOpen, setSearchFilterOpen] = useState(true)
  const [searchFilterVal, setSearchFilterVal] = useState('')

  useEffect(() => {
    const currentUrl = window.location.href
    const urlParsed = parseUrl(currentUrl)

    // set base url
    if (urlParsed.url) setBaseUrl(urlParsed.url)

    // apply filters from url params on initial load
    if (currentUrl.includes('#')) {
      const urlParams = parse(currentUrl.split('#').pop())
      const { sort, page, search } = urlParams

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }
  
      if (sort) setSortBy(sort)
      if (search) setSearchFilterVal(cleanString(search))
    }

    setReady(true)
  }, [])

  const createSortByQueryParam = sortField => {
    const currentSortBy = sortBy

    if (currentSortBy.includes(sortField)) {
       // if sortBy already is set to the current field switch is sorting order
       if (currentSortBy.includes('asc')) {
         setSortBy(`${sortField}-desc`)
        } else {
          setSortBy(`${sortField}-asc`)
       }
    } else {
      setSortBy(`${sortField}-asc`)
    }
  }

  const createSortByQuery = () => {
    let sortByValue;
  
    switch (sortBy) {
      case 'name-asc': 
        sortByValue = '&sort=ss_title asc'
        break
      case 'name-desc': 
        sortByValue = '&sort=ss_title desc'
        break
    }

    return sortByValue
  }

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      search: searchFilterVal && searchFilterVal.trim() ? searchFilterVal.trim() : '',
      sort: sortBy
    }, {
      skipEmptyString: true,
      skipNull: true,
      sort: false
    })

    const navigationUrl = stringifiedParams ? `${baseUrl}#?${stringifiedParams}` : baseUrl
    navigate(navigationUrl, { replace: true })
  }

  // filters functionality  
  const expandFilter = (setMethod, openState) => {
    // close any open filters before opening new filter

    // if the filter already open just close it
    if (openState) {
      setMethod(false)
    } else {
      setSearchFilterOpen(false)
      setMethod(true)
    }
  }

  const createFilterQuery = () => {
    let filterValue = '';
    const searchFilterTrimmed = searchFilterVal.trim().substring(0, 2)

    if (searchFilterTrimmed) {
      filterValue += `&fq=sm_postcodes:*${searchFilterTrimmed.toUpperCase()}*`
    }

    return filterValue
  }

  // data fetching functionality
  const requestResults = offsetVal => {
    setLoading(true)
    
    const sortByQuery = createSortByQuery()
    const filterQuery = createFilterQuery()
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

    fetchMedicalSchools({
      itemsPerPage: ITEMS_PER_PAGE,
      offset: requestOffset,
      querySort: sortByQuery,
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
            url: doc.ss_url_alias,
            name: doc.ss_title,
            postcodes: doc?.sm_postcodes?.join(', '),
            phone: doc.ss_field_contact_telephone,
            contactName: doc.ss_field_contact_name
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

    setSortBy('')
    setSearchFilterOpen(false)
    setSearchFilterVal('')
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
  }, [sortBy, searchFilterVal])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      <div id="medical-school-listing" className="medical-school-listing" style={{ minHeight: listingHeight }}>
        <div className="medical-school-listing-controls">
          {/* Filter expand toggles */}
          <div className="medical-school-listing-controls__wrapper">
            <div className="medical-school-listing-controls__filter medical-school-listing-controls__filter--search">
              <button
                type="button"
                className={`medical-school-listing-controls__filter-button ${searchFilterOpen ? 'medical-school-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setSearchFilterOpen, searchFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Postcode search
              </button>

              {isMobile && searchFilterOpen && (
                <SearchFilter
                  openState={searchFilterOpen}
                  filterVal={searchFilterVal}
                  setMethod={setSearchFilterVal}
                /> 
              )}
            </div>

            <div className="medical-school-listing-controls__reset">
              <ResetButton clickMethod={resetFilters} icon text="Reset filters" />
            </div>
          </div>

          {/* Filter inputs for tablet+ */}
          {!isMobile && (
            <>
              {searchFilterOpen && (
                <SearchFilter
                  openState={searchFilterOpen}
                  setOpenMethod={setSearchFilterOpen}
                  filterVal={searchFilterVal}
                  setMethod={setSearchFilterVal}
                  tabTarget=".medical-school-listing-controls__filter--search button"
                  ariaText="Search for a medical school by postcode"
                  placeholder="Search for a medical school by postcode"
                />
              )}

            </>
          )}
        </div>

        {results.length > 0 && (
          <div className="medical-school-listing-sort">
            <div className="medical-school-listing-sort__wrapper columns">
              <button type="button" onClick={() => createSortByQueryParam('name')} aria-label="sort by name" className="sort sort--name column is-4-mobile is-2">
                <img src={SortToggleArrows} role="presentation" aria-hidden alt="" />
                Name
              </button>

              <div className="sort sort--postcodes column is-4-mobile is-4">
                Postcodes covered
              </div>

              <div className="sort sort--phone column is-4-mobile is-2">
                Phone
              </div>

              <div className="sort sort--contact-name column is-3-mobile is-6">
                Contact name
              </div>
            </div>
          </div>
        )}

        {results && !loading && (
          <ContentListingTable
            items={results}
            total={total}
            itemsPerPage={ITEMS_PER_PAGE}
            handlePagination={handlePagination}
            offset={offset}
            loading={loading}
            currentPage={currentPage}
            cardType="medical-school"
            classes="medical-school-results"
            setListingHeight={setListingHeight}
            columns="12"
            noscriptMessage
          />
        )}
      </div>
    </>
  )
}

export default ListingMedicalSchools
