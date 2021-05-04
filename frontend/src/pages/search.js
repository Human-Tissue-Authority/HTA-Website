import React, { useState, useEffect, useRef } from "react"
import { window } from 'browser-monads'
import { parseUrl, stringify } from 'query-string'
import { navigate } from '@reach/router'
import CountUp from 'react-countup'
import Select from 'react-select'

import { fetchSearchResults } from "../utils/views"
import { cleanString, getPaginationOffset } from "../utils/utils"

import Layout from "../components/layout"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import SEO from "../components/seo"
import ContentListing from "../components/views/contentListing"
import ResetButton from "../components/misc/resetButton"
import { useHasMounted } from "../utils/hooks"

import grid from '../images/grid.svg'
import list from '../images/list.svg'

const CONTENT_TYPE_OPTIONS = [
  { value: 'blog', label: 'Blogs' },
  { value: 'establishment', label: 'Establishments' },
  { value: 'medical_school', label: 'Medical schools' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'article', label: 'News or events' },
  { value: 'page', label: 'Pages' },
  { value: 'vacancy', label: 'Vacancies' }
]

const ITEMS_PER_PAGE = 9

const Search = ({ location }) => {
  const locationState = location.state?.keywords
  
  // search functionality
  const [baseUrl, setBaseUrl] = useState(null)
  const [keywords, setKeywords] = useState(null)
  const [initialLoad, setInitialLoad] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [sortBy, setSortBy] = useState('relevance')
  const [selectedType, setSelectedType] = useState(null)
  const [listingHeight, setListingHeight] = useState('auto')
  const [cardType, setCardType] = useState('search')
  const listingRef = useRef(null)
  
  const handleChangeCardType = value => {
    if (value !== cardType) {
      requestResults()
      setCardType(value)
    }
  }

  // get keywords from url
  useEffect(() => {
    const currentUrl = window.location.href
    const urlParams = parseUrl(currentUrl)

    if (urlParams.query) {
      const { keywords, sort, type, page } = urlParams.query

      if (urlParams.url) setBaseUrl(urlParams.url)

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }
  
      if (sort) setSortBy(sort)

      if (type) {
        // get content type filter option from constant 
        const [ typeOption ] = CONTENT_TYPE_OPTIONS.filter(option => option.value === type)

        setSelectedType(typeOption)
      }
      
      if (keywords) {
        setKeywords(cleanString(keywords))
      } else {
        setKeywords(null)
      }
    }
  }, [locationState])

  const createSortByQuery = () => {
    let sortByValue;
  
    switch (sortBy) {
      case 'title': 
        sortByValue = '&sort=sort_X3b_en_title asc'
        break
      case 'date':
        sortByValue = '&sort=ds_changed desc'
        break
    }

    return sortByValue
  }
  
  const createFilterQuery = () => {
    let filterValue;
      
    if (selectedType) {
      filterValue = `&fq=ss_type:(${selectedType.value})`
    }

    return filterValue
  }

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const stringifiedParams = stringify({
      keywords,
      page: pageNumber > 0 ? pageNumber + 1 : '',
      type: selectedType ? selectedType.value : '',
      sort: sortBy
    }, {
      skipEmptyString: true,
      skipNull: true,
      sort: false
    })

    navigate(`${baseUrl}?${stringifiedParams}`)
  }

  const requestResults = offsetVal => {
    if (keywords && keywords.length > 0) {
      setLoading(true)
      
      const sortByQuery = createSortByQuery()
      const filterQuery = createFilterQuery()
      const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

      fetchSearchResults({
        keywords,
        itemsPerPage: ITEMS_PER_PAGE,
        offset: requestOffset,
        querySort: sortByQuery,
        queryFilters: filterQuery
      })
      .then(res => {
        if (res.response) {
          setOffset(requestOffset)
          setTotal(res.response.numFound)
          setResults(res.response.docs)
          setLoading(false)
        }
      })
      .catch(error => console.log({ error }))
    }
  }
  
  // initial page load request || new request is keyword changes
  useEffect(() => {
    if (!initialLoad && keywords && keywords.length > 0) {
      requestResults()
      setInitialLoad(true)
    } else if (keywords && keywords.length > 0) {
      setSortBy('relevance')
      setSelectedType(null)
      setCurrentPage(0)
      requestResults()
    }
  }, [keywords])

  // execute new request whenever sort or type filter changes
  useEffect(() => {
    if (initialLoad) {
      setCurrentPage(0)
      requestResults(0)
      silentlyPushUrlParams(0)
    }
  }, [sortBy, selectedType])

  // handle pagination
  const handlePagination = paginationData => {
    const listingEl = document.getElementById('search-listing')
    const listingScrollPos = listingEl.offsetTop - document.body.scrollTop - 85
    const { selected } = paginationData
    const offsetVal = Math.ceil(selected * ITEMS_PER_PAGE)

    setOffset(offsetVal)
    setCurrentPage(selected)

    window.scroll(0, listingScrollPos)

    requestResults(offsetVal)
    silentlyPushUrlParams(selected)
  }

  // handle reset listing controls
  const resetControls = () => {
    setSelectedType(null)
    setSortBy('relevance')
  }

  // ensure component has mounted / prevents window does not exist error during build	
  const hasMounted = useHasMounted()

  if (!hasMounted) {	
    return null	
  }

  return (
    <Layout classes="search-page" forceSearchOpen>
      <SEO title="Search" />
      <Breadcrumbs alias="/search" currentTitle="Search" />
      
      <div className="search__header columns">
        <div className="search__header-wrapper column is-8 is-offset-1">
          {keywords ? (
            <>
              <h1 className="h">Search results for</h1>
              <strong>{keywords}</strong>
            </>
          ) : (
            <h1 className="h">Search the Human Tissue Authority</h1>
          )}

          <CountUp end={total} duration={3} suffix=" Results" separator="," />
        </div>
      </div>

      <div ref={listingRef} id="search-listing" className="search-listing" style={{ minHeight: listingHeight }}>
        <div className="search-controls">
          <div className="search-controls__wrapper">
            <div className="search-controls__sort">
              <div className="search-controls__control search-controls__control--label">
                Sort by
              </div>

              <div className={`search-controls__control search-controls__control-sort ${sortBy === 'relevance' ? 'search-controls__control-sort--active' : ''}`}>
                <button type="button" onClick={() => setSortBy('relevance')} aria-label="sort by relevance">Relevance</button>
              </div>

              <div className={`search-controls__control search-controls__control-sort ${sortBy === 'title' ? 'search-controls__control-sort--active' : ''}`}>
                <button type="button" onClick={() => setSortBy('title')} aria-label="sort by title ascending">Title</button>
              </div>

              <div className={`search-controls__control search-controls__control-sort ${sortBy === 'date' ? 'search-controls__control-sort--active' : ''}`}>
                <button type="button" onClick={() => setSortBy('date')} aria-label="sort by date descending">Date</button>
              </div>
            </div>

            <div className="search-controls__filters">
              <div className="search-controls__control search-controls__control--content-type">
                <Select
                  options={CONTENT_TYPE_OPTIONS}
                  className="content-type-filter"
                  classNamePrefix="content-type-filter"
                  placeholder="Content type"
                  onChange={value => setSelectedType(value)}
                  isSearchable={false}
                  value={selectedType}
                  aria-label="Content type filter"
                />
              </div>
            </div>
            
            <div className="search-controls__additional-controls">
              <ResetButton clickMethod={resetControls} icon text="Reset filters" />
            </div>

            <div className="search-controls__view-type">
              <button aria-label="Display results as a grid" type="button" className={`${cardType === 'search' ? 'active' : ''}`} onClick={() => handleChangeCardType('search')}>
                <img src={grid} role="presentation" alt="" />
              </button>
              <button aria-label="Display results as rows" type="button" className={`${cardType === 'search-full-width' ? 'active' : ''}`} onClick={() => handleChangeCardType('search-full-width')}>
                <img src={list} role="presentation" alt="" />
              </button>
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
            cardType={cardType}
            classes="search-results"
            setListingHeight={setListingHeight}
          />
        )}
      </div>
    </Layout>
  )
}

export default Search
