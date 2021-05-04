import React from "react"
import ParagraphSimpleText from '../paragraphs/paragraphSimpleText'
import ParagraphLinksSection from '../paragraphs/paragraphLinksSection'
import ParagraphTextWithBackground from '../paragraphs/paragraphTextWithBackground'
import ParagraphPromotionalBlocks from '../paragraphs/paragraphPromotionalBlocks'
import ParagraphImageGallery from '../paragraphs/paragraphsImageGallery'
import ParagraphButton from '../paragraphs/paragraphButtons'
import ParagraphLargeNumberedList from '../paragraphs/paragraphLargeNumberedList'
import ParagraphTextWithCTA from '../paragraphs/paragraphTextWithCTA'
import ParagraphWebform from '../paragraphs/paragraphWebform'
import ParagraphAccordion from '../paragraphs/paragraphAccordion'
import ParagraphBiography from '../paragraphs/paragraphBiography'
import ParagraphPublications from '../paragraphs/paragraphPublications'
import ParagraphListing from '../paragraphs/paragraphListing'
import ParagraphDocumentsListing from '../paragraphs/paragraphDocumentsListing'
import ParagraphManualListing from '../paragraphs/paragraphManualListing'

const components = {
  paragraph__simple_text: ParagraphSimpleText,
  paragraph__links_section: ParagraphLinksSection,
  paragraph__text_with_background: ParagraphTextWithBackground,
  paragraph__promotional_blocks: ParagraphPromotionalBlocks,
  paragraph__image_gallery: ParagraphImageGallery,
  paragraph__button: ParagraphButton,
  paragraph__large_numbered_list: ParagraphLargeNumberedList,
  paragraph__text_with_cta: ParagraphTextWithCTA,
  paragraph__webform: ParagraphWebform,
  paragraph__accordion_wrapper: ParagraphAccordion,
  paragraph__biography_wrapper: ParagraphBiography,
  paragraph__publications: ParagraphPublications,
  paragraph__listing: ParagraphListing,
  paragraph__documents_listing: ParagraphDocumentsListing,
  paragraph__manual_listing: ParagraphManualListing
}

const paragraphHelper = (paragraphs, isFullWidth) => {
  return paragraphs.map(item => {
    if (components.hasOwnProperty(item.type)) {
      const ParagraphComponent = components[item.type]
      return <ParagraphComponent key={item.id} node={item} isFullWidth={isFullWidth} />
    }
  
    return <p className="column is-9 is-offset-1" key={item.id}>Unknown type {item.type}</p>
  })
}

export default paragraphHelper
