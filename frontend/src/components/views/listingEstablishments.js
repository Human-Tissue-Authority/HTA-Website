import React, { useState, useEffect, useRef } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import { useMediaQuery } from 'react-responsive'

import { fetchEstablishments } from '../../utils/views'
import { cleanString, getPaginationOffset } from '../../utils/utils'

import ContentListingTable from './contentListingTable'
import ResetButton from '../misc/resetButton'

import SortToggleArrows from '../../images/sort-toggle.svg'
import FilterArrow from '../../images/filter-arrow.svg'
import SearchGrey from '../../images/search--grey.svg'
import TermsFilter from '../misc/termsFilter'
import AlphabetFilter from '../misc/alphabetFilter'
import SearchFilter from '../misc/searchFilter'

const ITEMS_PER_PAGE = 20

const ListingEstablishments = () => {
  // fetch filter terms
  const data = useStaticQuery(graphql`
    {
      sectorTerms: allTaxonomyTermSector {
        nodes {
          id
          name
        }
      }
      mainLicenceTerms: allTaxonomyTermActivity {
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
  const [sortBy, setSortBy] = useState('licence-number-asc')
  const [listingHeight, setListingHeight] = useState('auto')
  const listingRef = useRef(null)

  // filters state
  const [searchFilterOpen, setSearchFilterOpen] = useState(false)
  const [searchFilterVal, setSearchFilterVal] = useState('')

  const [sectorFilterOpen, setSectorFilterOpen] = useState(false)
  const [sectorFilterVal, setSectorFilterVal] = useState([])

  const [mainLicenceFilterOpen, setMainLicenceFilterOpen] = useState(false)
  const [mainLicenceFilterVal, setMainLicenceFilterVal] = useState([])

  const [alphabetFilterOpen, setAlphabetFilterOpen] = useState(false)
  const [alphabetFilterVal, setAlphabetFilterVal] = useState([])

  useEffect(() => {
    const currentUrl = window.location.href
    const urlParsed = parseUrl(currentUrl)

    // set base url
    if (urlParsed.url) setBaseUrl(urlParsed.url)

    // apply filters from url params on initial load
    if (currentUrl.includes('#')) {
      const urlParams = parse(currentUrl.split('#').pop())
      const { sort, page, search, sector, main_licence, title } = urlParams

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }
  
      if (sort) setSortBy(sort)
      if (search) setSearchFilterVal(cleanString(search))
      if (sector) setSectorFilterVal(sector.split(','))
      if (main_licence) setMainLicenceFilterVal(main_licence.split(','))
      if (title) setAlphabetFilterVal(title.split(','))
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
      case 'licence-number-asc': 
        sortByValue = '&sort=ss_field_main_licence_number asc'
        break
      case 'licence-number-desc': 
        sortByValue = '&sort=ss_field_main_licence_number desc'
        break
      
      case 'licensed-premises-asc': 
        sortByValue = '&sort=ss_title asc'
        break
      case 'licensed-premises-desc': 
        sortByValue = '&sort=ss_title desc'
        break

      case 'licence-type-asc': 
        sortByValue = '&sort=bs_field_satellites_are_linked_to_a asc'
        break
      case 'licence-type-desc': 
        sortByValue = '&sort=bs_field_satellites_are_linked_to_a desc'
        break

      case 'licence-status-asc': 
        sortByValue = '&sort=ss_field_hta_licence_status asc'
        break
      case 'licence-status-desc': 
        sortByValue = '&sort=ss_field_hta_licence_status desc'
        break

      case 'sector-asc': 
        sortByValue = '&sort=sort_X3b_en_sector_tags asc'
        break
      case 'sector-desc': 
        sortByValue = '&sort=sort_X3b_en_sector_tags desc'
        break
    }

    return sortByValue
  }

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      search: searchFilterVal && searchFilterVal.trim() ? searchFilterVal.trim() : '',
      sector: sectorFilterVal.length > 0 ? sectorFilterVal.join(',') : '',
      main_licence: mainLicenceFilterVal.length > 0 ? mainLicenceFilterVal.join(',') : '',
      title: alphabetFilterVal.length > 0 ? alphabetFilterVal.join(',') : '',
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
      setSectorFilterOpen(false)
      setMainLicenceFilterOpen(false)
      setAlphabetFilterOpen(false)
      setMethod(true)
    }
  }

  const createFilterQuery = () => {
    let filterValue = '';
    const searchFilterTrimmed = searchFilterVal.trim()

    if (searchFilterTrimmed) {
      filterValue += `&fq=tm_X3b_en_field_search_all:${searchFilterTrimmed}*`
    }

    if (sectorFilterVal.length > 0) {
      filterValue += `&fq=sm_sector_tags:("${sectorFilterVal.join('" OR "')}")`
    }

    if (mainLicenceFilterVal.length > 0) {
      filterValue += `&fq=sm_main_licence_activities:("${mainLicenceFilterVal.join('" OR "')}")`
    }

    if (alphabetFilterVal.length > 0) {
      const lettersFormatted = alphabetFilterVal.map(letter => `${letter}*`)

      filterValue += `&fq=ss_title:(${lettersFormatted.join(' OR ')})`
    }

    return filterValue
  }

  // data fetching functionality
  const requestResults = offsetVal => {
    setLoading(true)
    
    const sortByQuery = createSortByQuery()
    const filterQuery = createFilterQuery()
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

    fetchEstablishments({
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
            url: doc.ss_alias,
            licenceNumber: doc.ss_field_main_licence_number,
            licensedPremises: doc.ss_title,
            licenceType: doc.bs_field_satellites_are_linked_to_a ? 'Satellite' : 'Main',
            licenceStatus: doc.ss_field_hta_licence_status,
            sector: doc.sm_sector_tags ? doc.sm_sector_tags[0] : ''
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
    setSectorFilterOpen(false)
    setMainLicenceFilterOpen(false)
    setAlphabetFilterOpen(false)

    setSearchFilterVal('')
    setSectorFilterVal([])
    setMainLicenceFilterVal([])
    setAlphabetFilterVal([])
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
  }, [sortBy, searchFilterVal, sectorFilterVal, mainLicenceFilterVal, alphabetFilterVal])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      <section id="establishment-listing" className="establishment-listing" style={{ minHeight: listingHeight }}>
        <div className="establishment-listing-controls">
          {/* Filter expand toggles */}
          <div className="establishment-listing-controls__wrapper">
            <div className="establishment-listing-controls__filter establishment-listing-controls__filter--search">
              <button
                type="button"
                className={`establishment-listing-controls__filter-button ${searchFilterOpen ? 'establishment-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setSearchFilterOpen, searchFilterOpen)}
              >
                <img src={SearchGrey} role="presentation" aria-hidden alt="" />
                Search
              </button>

              {isMobile && searchFilterOpen && <SearchFilter openState={searchFilterOpen} filterVal={searchFilterVal} setMethod={setSearchFilterVal} tabTarget=".establishment-listing-controls__filter--search" /> }
            </div>

            <div className="establishment-listing-controls__filter establishment-listing-controls__filter--sector">
              <button
                type="button"
                className={`establishment-listing-controls__filter-button ${sectorFilterOpen ? 'establishment-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setSectorFilterOpen, sectorFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Sector
              </button>
  
              {isMobile && sectorFilterOpen && <TermsFilter terms={data.sectorTerms.nodes} openState={sectorFilterOpen} filterVal={sectorFilterVal} setMethod={setSectorFilterVal} /> }
            </div>

            <div className="establishment-listing-controls__filter establishment-listing-controls__filter--main-licence">
              <button
                type="button"
                className={`establishment-listing-controls__filter-button ${mainLicenceFilterOpen ? 'establishment-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setMainLicenceFilterOpen, mainLicenceFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Main licence activities
              </button>

              {isMobile && mainLicenceFilterOpen && <TermsFilter terms={data.mainLicenceTerms.nodes} openState={mainLicenceFilterOpen} filterVal={mainLicenceFilterVal} setMethod={setMainLicenceFilterVal} /> }
            </div>

            <div className="establishment-listing-controls__filter establishment-listing-controls__filter--alphabet">
              <button
                type="button"
                className={`establishment-listing-controls__filter-button ${alphabetFilterOpen ? 'establishment-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setAlphabetFilterOpen, alphabetFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Browse by name (A-Z)
              </button>

              {isMobile && alphabetFilterOpen && <AlphabetFilter openState={alphabetFilterOpen} filterVal={alphabetFilterVal} setMethod={setAlphabetFilterVal} /> }
            </div>

            <div className="establishment-listing-controls__reset">
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
                  tabTarget=".establishment-listing-controls__filter--search button"
                />
              )}

              {sectorFilterOpen && (
                <TermsFilter
                  terms={data.sectorTerms.nodes}
                  openState={sectorFilterOpen}
                  filterVal={sectorFilterVal}
                  setMethod={setSectorFilterVal} 
                />
              )}

              {mainLicenceFilterOpen && (
                <TermsFilter
                  terms={data.mainLicenceTerms.nodes}
                  openState={mainLicenceFilterOpen}
                  filterVal={mainLicenceFilterVal}
                  setMethod={setMainLicenceFilterVal}
                />
              )}

              {alphabetFilterOpen && (
                <AlphabetFilter
                  openState={alphabetFilterOpen}
                  filterVal={alphabetFilterVal}
                  setMethod={setAlphabetFilterVal}
                />
              )}
            </>
          )}
        </div>

        {results.length > 0 && (
          <div className="establishment-listing-sort">
            <div className="establishment-listing-sort__wrapper columns">
              <button type="button" onClick={() => createSortByQueryParam('licence-number')} aria-label="sort by licence number" className="sort sort--licence-number column is-3-mobile is-2">
                <img src={SortToggleArrows} role="presentation" aria-hidden alt="" />
                Licence Number
              </button>

              <button type="button" onClick={() => createSortByQueryParam('licensed-premises')} aria-label="sort by licensed premises" className="sort sort--licensed-premises column is-6-mobile is-4">
                <img src={SortToggleArrows} role="presentation" aria-hidden alt="" />
                Licensed Premises
              </button>

              <button type="button" onClick={() => createSortByQueryParam('licence-type')} aria-label="sort by licence type" className="sort sort--licence-type column is-2">
                <img src={SortToggleArrows} role="presentation" aria-hidden alt="" />
                Licence type
              </button>

              <button type="button" onClick={() => createSortByQueryParam('licence-status')} aria-label="sort by licence stauts" className="sort sort--licence-status column is-2">
                <img src={SortToggleArrows} role="presentation" aria-hidden alt="" />
                Licence status
              </button>

              <button type="button" onClick={() => createSortByQueryParam('sector')} aria-label="sort by sector" className="sort sort--sector column is-3-mobile is-2">
                <img src={SortToggleArrows} role="presentation" aria-hidden alt="" />
                Sector
              </button>
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
            cardType="establishment"
            classes="establishments-results"
            setListingHeight={setListingHeight}
            columns="12"
          />
        )}
      </section>
    </>
  )
}

export default ListingEstablishments
