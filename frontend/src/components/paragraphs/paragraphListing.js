import React, { useState } from "react"
import { graphql } from "gatsby"
import ParagraphWrapper from "./paragraphWrapper"
import ListingEstablishments from "../views/listingEstablishments"
import ListingMedicalSchools from "../views/listingMedicalSchools"
import ListingCurrentVacancies from "../views/listingCurrentVacancies"
import ListingBlog from "../views/listingBlog"
import ListingEvents from "../views/listingEvents"
import ListingNews from "../views/listingNews"
import ListingMeetings from "../views/listingMeetings"
import ListingFoi from "../views/listingFoi"

const ParagraphListing = ({ node, isFullWidth }) => {
  const [show, setShow] = useState(false)
  const [isGrid, setIsGrid] = useState(false)

  const listingType = node.field_listing

  if (!listingType === 'Establishments' && !listingType === 'Medical Schools') {
    setIsGrid(true)
  }

  const renderListing = () => {
    switch(listingType) {
      case 'Establishments':
        return <ListingEstablishments />
      case 'Medical Schools':
        return <ListingMedicalSchools />
      case 'Current vacancies':
        return <ListingCurrentVacancies />
      case 'Blogs':
        return <ListingBlog />
      case 'Events':
        return <ListingEvents />
      case 'FOI':
        return <ListingFoi/>
      case 'News':
        return <ListingNews />
      case 'Meetings':
        return <ListingMeetings displayPrevious={node.field_display_previous_meetings} />
      default: return null
    }
  }

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeIn"
      classes={`section paragraph-listing ${isGrid ? 'columns' : ''}`}
    >
      {renderListing()}
    </ParagraphWrapper>
  )
}

export default ParagraphListing

export const fragment = graphql`
  fragment ParagraphListing on paragraph__listing {
    id
    field_listing
    field_display_previous_meetings
  }
`
