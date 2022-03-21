import React, { useState, useEffect, useRef } from 'react'
import { fetchCurrentVacancies } from '../../utils/views'
import ContentListing from './contentListing'
import dayjs from 'dayjs'

const ListingCurrentVacancies = () => {
  // listing state
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [offset, setOffset] = useState(0)
  const [listingHeight, setListingHeight] = useState('auto')
  const listingRef = useRef(null)

  useEffect(() => {
    requestResults(0)
  }, [])

  const sortEqualClosingTime = formattedResults => {
    let startIndex;
    let endIndex;
    let vacanciesEqualClosingTime = []

    //get array of vacancies which has same closing time
    const getEqualTimeVacancies = (closingDate, index) => formattedResults.map((res, indexNested) => {
      const isClosingTimeEqual = dayjs(closingDate).format('HDDMMYY') === dayjs(res.closingDate).format('HDDMMYY')

      if (isClosingTimeEqual && index !== indexNested) {
        vacanciesEqualClosingTime.indexOf(res) === -1 && vacanciesEqualClosingTime.push(res)
      }
    })
    formattedResults.map(({closingDate}, index) => getEqualTimeVacancies(closingDate, index))

    //if no vacancies with same closing time
    if (vacanciesEqualClosingTime.length === 0) return formattedResults

    //get array with vacancies and index corresponding to index from initial array - formattedResults
    let vacanciesWithIndex = vacanciesEqualClosingTime.map(res => ({
        index: formattedResults.indexOf(res),
        vacancy: res
      })
    )
    
    //sort temporary by index        
    vacanciesWithIndex.sort((a, b) => a.index.toString().localeCompare(b.index.toString()))

    vacanciesWithIndex.map((res, i) => {
      let nextVacancy = vacanciesWithIndex[i + 1]
      let thisVacancy = res
      if (i === 0) {
        startIndex = thisVacancy.index
      }
      //check if next index exist and if is larger by 1
      if (nextVacancy?.index && thisVacancy.index === nextVacancy?.index - 1) {
        endIndex = nextVacancy?.index

      } else if (nextVacancy || i === vacanciesWithIndex.length - 1) {
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

  const requestResults = offsetVal => {
    setLoading(true)
    const requestOffset = Number.isInteger(offsetVal) ? offsetVal : offset
    
    fetchCurrentVacancies({
      offset: requestOffset,
    })
    .then(res => {
      if (res.response) {
        setOffset(requestOffset)
        const isCurrent = date => dayjs(date).isAfter(new Date())

        // format results
        const formattedResults = res.response.docs
        .filter(({its_nid, ds_field_date}) => its_nid && isCurrent(ds_field_date))
        .map(doc => ({
          id: doc.its_nid,
          title: doc.ss_title,
          link: doc.ss_alias,
          body: doc.tm_X3b_en_body && doc.tm_X3b_en_body[0],
          created: doc.ds_created,
          summary: doc.ss_summary,
          closingDate: doc.ds_field_date
        })
        )

        const sortedResults = sortEqualClosingTime(formattedResults)
        setResults(sortedResults)
        setLoading(false)
      }
    })
    .catch(error => console.log({ error }))
  }

  return (
    <>
      <div ref={listingRef} style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }} />
      <section id="current-vacancy-listing" className="current-vacancy-listing" style={{ minHeight: listingHeight }}>
        {results && !loading && (
          <ContentListing
            items={results}
            offset={offset}
            loading={loading}
            cardType="currentVacancy"
            classes="current-vacancy-results"
            setListingHeight={setListingHeight}
            columns="4"
            noResultsMessage={'No current vacancies'}
            noscriptMessage
          />
        )}
      </section>
    </>
  )
}

export default ListingCurrentVacancies