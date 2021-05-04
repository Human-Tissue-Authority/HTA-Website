import React, { useState, useEffect, useRef } from 'react'
import { window } from 'browser-monads'
import { parseUrl, parse, stringify } from 'query-string'
import { navigate } from '@reach/router'
import { fetchnewss, fetchNews, fetchFoi } from '../../utils/views'
import { getPaginationOffset } from '../../utils/utils'
import ContentListing from './contentListing'
import Select from 'react-select'
import { graphql, useStaticQuery } from 'gatsby'
import dayjs from 'dayjs'

const ITEMS_PER_PAGE = 9

const ListingFoi = () => {
  // fetch filter terms
  const data = useStaticQuery(graphql`
    {
      allTaxonomyTermAudience: allTaxonomyTermAudience {
        nodes {
          id
          name
        }
      }
      allTaxonomyTermSector: allTaxonomyTermSector {
        nodes {
          name
          id
        }
      }
      allTaxonomyTermTags: allTaxonomyTermTags {
        nodes {
          name
          id
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

  //selected filter audience
  const [selectedAudience, setSelectedAudience] = useState([])
  //selected filter sectors
  const [selectedSectors, setSelectedSectors] = useState([])
  //selected filter tags
  const [selectedTags, setSelectedTags] = useState([])

  const handleChangeAudience = audience => setSelectedAudience(audience)
  const handleChangeSectors = sectors => setSelectedSectors(sectors)
  const handleChangeTags = tags => setSelectedTags(tags)

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

      if (audience) {
        const audienceSlugs = audience.split(',')
        handleChangeAudience(parseOptions(audienceSlugs, 'toLabel'))
      }

      if (sector) {
        const sectorSlugs = sector.split(',')
        handleChangeSectors(parseOptions(sectorSlugs, 'toLabel'))
      }

      if (tags) {
        const tagsList = tags.split(',')
        handleChangeTags(parseOptions(tagsList, 'toLabel'))
      }
    }
    setReady(true)
  }, [])

  const getOptions = data => parseOptions(data.map(term => term.name), 'toSlug')

  const parseOptions = (data, parseType) => data.map(item => {
    //get select input object with parsed label or slug
    let value = item
    let label = item
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

  const silentlyPushUrlParams = (pageNumber = currentPage) => {
    const getSlugStrings = data => data && data.length > 0 ? data.map(item => item.value).join() : ''

    //get parsed params from state
    const selectedAudienceParams = getSlugStrings(selectedAudience)
    const selectedSectorsParams = getSlugStrings(selectedSectors)
    const selectedTagsParams = getSlugStrings(selectedTags)

    const stringifiedParams = stringify({
      page: pageNumber > 0 ? pageNumber + 1 : '',
      audience: selectedAudienceParams,
      tags: selectedTagsParams,
      sector: selectedSectorsParams,
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

    if (selectedSectors && selectedSectors.length > 0) {
      const sectorsParsed = getSolrNames(selectedSectors)
      filterValue += `&fq=sm_sector_tags:(${sectorsParsed})`
    }

    if (selectedTags && selectedTags.length > 0) {
      const tagsParsed = getSolrNames(selectedTags)
      filterValue += `&fq=sm_tags:(${tagsParsed})`
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
  }, [selectedAudience, selectedSectors, selectedTags])

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointernewss: 'none' }} />
      <div id="article-listing" className="article-listing" style={{ minHeight: listingHeight }}>
        <div className="article-listing-controls">
          <div className="article-listing-controls__wrapper">
            <div className="article-listing-controls__filter article-listing-controls__filter--search">
              <div
                className={`article-listing-controls__filter-button`}
              >
                <Select
                  options={getOptions(data.allTaxonomyTermAudience.nodes)}
                  className="article-listing-filter"
                  classNamePrefix="article-listing-filter"
                  placeholder="Audience"
                  aria-label="Select audience"
                  autoFocus={true}
                  onChange={handleChangeAudience}
                  isSearchable={false}
                  value={selectedAudience}
                  isMulti
                />

                <Select
                  options={getOptions(data.allTaxonomyTermSector.nodes)}
                  className="article-listing-filter medium-filter"
                  classNamePrefix="article-listing-filter"
                  placeholder="Sector"
                  aria-label="Select sector"
                  autoFocus={true}
                  onChange={handleChangeSectors}
                  isSearchable={false}
                  value={selectedSectors}
                  isMulti
                />

                <Select
                  options={getOptions(data.allTaxonomyTermTags.nodes)}
                  className="article-listing-filter small-filter"
                  classNamePrefix="article-listing-filter"
                  placeholder="Select tags"
                  aria-label="tags"
                  autoFocus={true}
                  onChange={handleChangeTags}
                  isSearchable={false}
                  value={selectedTags}
                  isMulti
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
            cardType="foi"
            classes="news-listing-results"
            setListingHeight={setListingHeight}
            columns="4"
            columnsResponsive="12"
          />
        )}
      </div>
    </>
  )
}

export default ListingFoi
