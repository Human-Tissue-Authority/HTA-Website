import React, { useState, useEffect } from "react"
import { graphql } from "gatsby"
import ParagraphWrapper from "./paragraphWrapper"
import Accordion from "../content/accordion"
import { parseContent } from "../../utils/utils"

const ParagraphBiography = ({ node, isFullWidth }) => {
  const [expand, setExpand] = useState(null)
  const [show, setShow] = useState(false)
  
  //get ordered biographies - with image, branch, and display flag
  let biographiesData = []

  const biographies = node?.relationships?.field_biography_item?.map(item => {
    return {
      branch: item.relationships.field_branch[0],
      biography: [{...item, ...item.relationships?.field_image?.relationships?.field_media_image?.localFile?.childImageSharp?.fluid}]
    }
  }).map(item => {
    const duplicateIndex = biographiesData.map(val => val.branch.name).indexOf(item.branch.name)
    const isDuplicate = duplicateIndex !== -1

    if (!isDuplicate) {
      biographiesData.push(item)
    }

    if (isDuplicate) {
      biographiesData[duplicateIndex].biography.push(item.biography[0])
    }

  })

  //set on start expanded branch
  useEffect(() => {
    biographiesData.map(({branch}) => branch.field_display === 'Expanded' && setExpand(branch.name))
  }, [])

  const handleChangeExpand = (e, summary) => {
    e.stopPropagation()
    setExpand(prevState => prevState === summary ? null : summary)
  }

  return (
    <ParagraphWrapper
      show={show}
      setShow={setShow}
      animationStyle="fadeInFromLeft"
      classes="section paragraph-biography"
    >
    <div className="paragraph-biography__wrapper columns">
      <div className="column is-10 is-offset-1">
        {biographiesData.map(({biography, branch}) => (
          <Accordion 
            summary={branch.name} 
            details={<Biography items={biography}/>} 
            classes="paragraph-biography-accordion" 
            onExpand={handleChangeExpand} 
            expand={expand}
            duration={600}
          />
        ))}
      </div>
    </div>
  </ParagraphWrapper>
  )
}

//single biography item
const Biography = ({items}) => {

  return (
    <div className="biography-wrapper">
      <div className="columns is-multiline">
        {items.map(bio => (
        <div className="column is-4-widescreen is-6-desktop">
          <div className="biography-details">
            <div className="biography-details__header">
              {bio?.originalImg && (
                <img src={bio?.originalImg} alt="" className='biography-details__avatar' />
              )}
                <div>
                  <div className="biography-details__title">
                  {bio.field_title}
                  </div>
                  <div className="biography-details__job_title">
                    {bio.field_job_title}
                  </div>
                </div>
            </div>
            <div className="biography-details__biography" dangerouslySetInnerHTML={{ __html: parseContent(bio.field_biography.value) }}>
            </div>
          </div>
        </div>
        ))}
      </div>
    </div>
  )
}

export default ParagraphBiography

export const fragment = graphql`
  fragment ParagraphBiography on paragraph__biography_wrapper {
    id
    relationships {
      field_biography_item {
        field_title
        field_job_title
        field_biography {
          value
        }
        relationships {
          field_branch {
            name
            field_display
          }
          field_image {
            relationships {
              field_media_image {
                localFile {
                  childImageSharp {
                    fluid {
                      originalImg
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
