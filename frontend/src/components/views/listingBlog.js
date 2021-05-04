import React, { useState, useEffect, useRef } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { navigate } from '@reach/router'
import { useMediaQuery } from 'react-responsive'
import { parseUrl, parse, stringify } from 'query-string'
import { window } from 'browser-monads'
import dayjs from 'dayjs'

import { fetchBlogPosts } from '../../utils/views'
import { getPaginationOffset } from '../../utils/utils'

import ContentListing from './contentListing'
import ResetButton from '../misc/resetButton'
import FilterArrow from '../../images/filter-arrow.svg'
import TermsFilter from '../misc/termsFilter'

const ITEMS_PER_PAGE = 9

const ListingBlog = () => {
  // fetch filter terms
  const data = useStaticQuery(graphql`
    {
      allTaxonomyTermAudience: allTaxonomyTermAudience {
        nodes {
          id
          name
        }
      }
    }
  `)

  const categoryNames = data.allTaxonomyTermAudience.nodes.map(term => {
    return { id: term.id, name: term.name }
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
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false)
  const [categoryFilterVal, setCategoryFilterVal] = useState([])

  useEffect(() => {
    const currentUrl = window.location.href
    const urlParsed = parseUrl(currentUrl)

    // set base url
    if (urlParsed.url) setBaseUrl(urlParsed.url)

    // apply filters from url params on initial load
    if (currentUrl.includes('#')) {
      const urlParams = parse(currentUrl.split('#').pop())
      const { page, category } = urlParams

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }

      if (category) setCategoryFilterVal(category.split(','))
    }

    setReady(true)
  }, [])

  const sortEqualDate = formattedResults => {
    let startIndex;
    let endIndex;
    let equalDatePosts = []
    //get array of vacancies which has same closing time
    const getEqualTimeVacancies = (date, index) => formattedResults.map((res, indexNested) => {
      const isClosingTimeEqual = dayjs(date).format('DDMMYY') === dayjs(res.date).format('DDMMYY')

      if (isClosingTimeEqual && index !== indexNested) {
        equalDatePosts.indexOf(res) === -1 && equalDatePosts.push(res)
      }
    })
    formattedResults.map(({date}, index) => getEqualTimeVacancies(date, index))
    //if no vacancies with same closing time
    if (equalDatePosts.length === 0) return formattedResults

    //get array with vacancies and index corresponding to index from initial array - formattedResults
    let postsWithIndex = equalDatePosts.map(res => ({
        index: formattedResults.indexOf(res),
        vacancy: res
      })
    )
    
    //sort temporary by index        
    postsWithIndex.sort((a, b) => a.index.toString().localeCompare(b.index.toString()))

    postsWithIndex.map((res, i) => {
      let nextVacancy = postsWithIndex[i + 1]
      let thisVacancy = res
      if (i === 0) {
        startIndex = thisVacancy.index
      }
      //check if next index exist and if is larger by 1
      if (nextVacancy?.index && thisVacancy.index === nextVacancy?.index - 1) {
        endIndex = nextVacancy?.index

      } else if (nextVacancy || i === postsWithIndex.length - 1) {
        const partOfResultsToSort = formattedResults.slice(startIndex, endIndex + 1)
        //sort by vacancy title
        partOfResultsToSort.sort((a, b) => a.title.localeCompare(b.title))
        // replace unsorted part 
        formattedResults.splice(startIndex, endIndex - startIndex + 1, ...partOfResultsToSort)
        // if more vacancies with same closing time exist - then set new start index
        if (nextVacancy) {
          startIndex = nextVacancy.index
        }
      } 
    })
    return formattedResults
  }

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      category: categoryFilterVal.length > 0 ? categoryFilterVal.join(',') : ''
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
      setCategoryFilterOpen(false)
      setMethod(true)
    }
  }

  // filters functionality  
  const createFilterQuery = () => {
    let filterValue = '';

    if (categoryFilterVal.length > 0) {
      filterValue += `&fq=sm_audience:("${categoryFilterVal.join('" OR "')}")`
    }

    return filterValue
  }

  // data fetching functionality
  const requestResults = offsetVal => {
    setLoading(true)
    
    const filterQuery = createFilterQuery()
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

    fetchBlogPosts({
      itemsPerPage: ITEMS_PER_PAGE,
      offset: requestOffset,
      queryCategories: filterQuery
    })
    .then(res => {
      if (res.response) {
        setOffset(requestOffset)
        setTotal(res.response.numFound)

        // format results
        const formattedResults = res.response.docs.filter(doc => doc.its_nid).map(doc => {
          return {
            id: doc.its_nid,
            title: doc.ss_title,
            tags: doc.sm_tags,
            link: doc.ss_alias,
            audience: doc.sm_audience,
            body: doc.tm_X3b_en_body,
            date: doc.ds_created
          }
        })
        const sortedEqualDateResults = sortEqualDate(formattedResults) 
        setResults(sortedEqualDateResults)
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

    setCategoryFilterVal([])
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
  }, [categoryFilterVal])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      <div id="blog-listing" className="blog-listing" style={{ minHeight: listingHeight }}>
        <div className="blog-listing-controls">
          {/* Filter expand toggles */}
          <div className="blog-listing-controls__wrapper">
            <div className="blog-listing-controls__filter">
              <button
                type="button"
                className={`blog-listing-controls__filter-button ${categoryFilterOpen ? 'blog-listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setCategoryFilterOpen, categoryFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Category
              </button>

              {isMobile && categoryFilterOpen && (
                <TermsFilter
                  terms={categoryNames}
                  openState={categoryFilterOpen}
                  filterVal={categoryFilterVal}
                  setMethod={setCategoryFilterVal}
                />
              )}
            </div>

            <div className="blog-listing-controls__reset">
              <ResetButton clickMethod={resetFilters} icon text="Reset filters" />
            </div>
          </div>

          {/* Filter inputs for tablet+ */}
          {!isMobile && categoryFilterOpen && (
            <TermsFilter
              terms={categoryNames}
              openState={categoryFilterOpen}
              filterVal={categoryFilterVal}
              setMethod={setCategoryFilterVal}
            />
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
            cardType="blog"
            classes="search-results"
            setListingHeight={setListingHeight}
            columns="4"
          />
        )}
      </div>
    </>
  )
}

export default ListingBlog
