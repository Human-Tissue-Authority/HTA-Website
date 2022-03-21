import React, { useState, useEffect, useRef } from 'react'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import { fetchFoi } from '../../utils/views'
import { getPaginationOffset } from '../../utils/utils'
import ContentListing from './contentListing'
import { graphql, useStaticQuery } from 'gatsby'
import { useMediaQuery } from 'react-responsive'
import TermsFilter from '../misc/termsFilter'
import FilterArrow from '../../images/filter-arrow.svg'
import ResetButton from '../misc/resetButton'

const ITEMS_PER_PAGE = 15

const ListingFoi = () => {
  // fetch filter terms
  const data = useStaticQuery(graphql`
    {
      audienceTerms: allTaxonomyTermAudience {
        nodes {
          id
          name
        }
      }
      sectorTerms: allTaxonomyTermSector {
        nodes {
          name
          id
        }
      }
      tagsTerms: allTaxonomyTermTags {
        nodes {
          name
          id
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

  const [sectorFilterOpen, setSectorFilterOpen] = useState(false)
  const [sectorFilterVal, setSectorFilterVal] = useState([])

  // close any open filters before opening new filter
  const expandFilter = (setMethod, openState) => {
    // if the filter already open just close it
    if (openState) {
      setMethod(false)
    } else {
      setAudienceFilterOpen(false)
      setTagsFilterOpen(false)
      setSectorFilterOpen(false)
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
    setSectorFilterOpen(false)

    // reset all filter values
    setAudienceFilterVal([])
    setTagsFilterVal([])
    setSectorFilterVal([])
  }

  useEffect(() => {
    const currentUrl = window.location.href
    const urlParsed = parseUrl(currentUrl)

    // set base url
    if (urlParsed.url) setBaseUrl(urlParsed.url)

    // apply filters from url params on initial load
    if (currentUrl.includes('#')) {
      const urlParams = parse(currentUrl.split('#').pop())
      const { page, audience, sector, tags } = urlParams

      if (page) {
        const paginationOffset = getPaginationOffset(page, ITEMS_PER_PAGE)
        setOffset(paginationOffset)
        setCurrentPage(parseInt(page) - 1)
      }

      if (audience) setAudienceFilterVal(audience.split(','))
      if (tags) setTagsFilterVal(tags.split(','))
      if (sector) setSectorFilterVal(sector.split(','))
    }

    setReady(true)
  }, [])

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const joinFilterValues = values => values.length > 0 ? values.join(',') : ''

    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      audience: joinFilterValues(audienceFilterVal),
      tags: joinFilterValues(tagsFilterVal),
      sector: joinFilterValues(sectorFilterVal),
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

    if (sectorFilterVal.length > 0) {
      filterValue += `&fq=sm_sector_tags:("${sectorFilterVal.join('" OR "')}")`
    }

    return filterValue
  }

  // data fetching functionality
  const requestResults = offsetVal => {
    setLoading(true)
    
    const filterQuery = createFilterQuery()
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset

    fetchFoi({
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
            sector: doc.sm_sector_tags,
            audience: doc.sm_audience,
            body: doc.tm_X3b_en_body,
            date: doc.ds_field_date,
            summary: doc.ss_summary,
            attachment: doc.sm_url_1 && doc.sm_url_1[0]
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
  }, [audienceFilterVal, tagsFilterVal, sectorFilterVal])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointernewss: 'none' }} />
      <div id="foi-listing" className="listing listing-foi" style={{ minHeight: listingHeight }}>
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
              <button
                type="button"
                className={`listing-controls__filter-button ${sectorFilterOpen ? 'listing-controls__filter-button--active' : ''}`}
                onClick={() => expandFilter(setSectorFilterOpen, sectorFilterOpen)}
              >
                <img src={FilterArrow} role="presentation" aria-hidden alt="" />
                Sector
              </button>

              {isMobile && sectorFilterOpen && <TermsFilter terms={data.sectorTerms.nodes} openState={sectorFilterOpen} filterVal={sectorFilterVal} setMethod={setSectorFilterVal} /> }
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

              {sectorFilterOpen && (
                <TermsFilter
                  terms={data.sectorTerms.nodes}
                  openState={sectorFilterOpen}
                  filterVal={sectorFilterVal}
                  setMethod={setSectorFilterVal}
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
            cardType="foi"
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

export default ListingFoi
