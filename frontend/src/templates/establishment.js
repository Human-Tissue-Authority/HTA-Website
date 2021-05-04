import React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import "../scss/main.scss"
import paragraphHelper from "../components/helpers/paragraphHelper"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import Title from "../components/content/title"
import LastUpdated from "../components/content/lastUpdated"
import KeyInformation from "../components/content/keyInformation"
import RelatedLicences from "../components/content/relatedLicences"
import TagGroup from "../components/content/tagGroup"
import FileDownloadGroup from "../components/content/fileDownloadGroup"
import SubscribeEstablishment from "../components/forms/subscribeEstablishment"
import Button from "../components/misc/button"

const Establishment = ({ data }) => {
  const { nodeEstablishment } = data
  const paragraphs = paragraphHelper(nodeEstablishment.relationships.paragraphs)

  // format data
  const licenceInformation = [
    {
      label: 'Licence number',
      value: nodeEstablishment.licenceNumber
    },
    {
      label: 'Licenced premises',
      value: nodeEstablishment.licencedPremises
    },
    {
      label: 'Designated individual',
      value: nodeEstablishment.designatedIndividual
    },
    {
      label: 'Licence status',
      value: nodeEstablishment.licenceStatus
    },
    {
      label: nodeEstablishment.relationships.field_sector.length > 1 ? 'Sectors' : 'Sector',
      value: nodeEstablishment.relationships.field_sector.map(item => item.name),
      wide: true
    },
  ]

  const inspectionReports = nodeEstablishment.relationships.field_inspection_report.map(item => {
    if (item.relationships) {
      const url = process.env.API_ROOT + item.relationships.field_media_file_1.uri.url
      const label = item.field_inspection_date
  
      return {
        url,
        label
      }
    }
  })

  const inspectionReportsCleaned = inspectionReports.filter(item => item != null)

  const relatedLicencesArr = nodeEstablishment.relationships.field_related_licences

  return (
    <Layout withSectionOverlay>
      <SEO title={`${nodeEstablishment.title} | Establishment`} />

      <Breadcrumbs alias={nodeEstablishment.path.alias} currentTitle={nodeEstablishment.title} />
      
      <LastUpdated timestamp={nodeEstablishment.changed} />
      <Title title={nodeEstablishment.title} />

      <KeyInformation items={licenceInformation} />

      {relatedLicencesArr && relatedLicencesArr.length > 0 && (
        <RelatedLicences items={relatedLicencesArr} />
      )}

      <TagGroup title="Licenced activities" tags={nodeEstablishment.relationships.licencedActivities} />

      {inspectionReportsCleaned && inspectionReportsCleaned.length > 0 && (
        <FileDownloadGroup title="Inspection reports" files={inspectionReportsCleaned} />
      )}

      <div className="establishment__contact columns is-multiline">
        <p className="column is-6 is-offset-1">
          If you have a question about this establishment please contact us, the establishment's details will automatically be added to the contact form.
        </p>
        
        <div className="column is-6 is-offset-1">
          <Button
            text="CONTACT THE HTA"
            ariaText="Contact the HTA"
            link={`/make-an-enquiry?establishment=${nodeEstablishment.drupal_internal__nid}`}
            showArrow
          />
        </div>
      </div>

      {paragraphs}

      <div className="section--overlay">
        <div className="section--overlay--wrapper columns is-multiline">
          <SubscribeEstablishment nid={nodeEstablishment.drupal_internal__nid} />
        </div>
      </div>
    </Layout>
  )
}

export default Establishment

export const query = graphql`
  query($EstablishmentId: String!) {
    nodeEstablishment(id: { eq: $EstablishmentId }) {
      id
      drupal_internal__nid
      title
      changed(formatString: "DD MMM Y")
      path {
        alias
      }
      licenceNumber: field_main_licence_number
      licencedPremises: field_name_of_the_establishment_
      designatedIndividual: field_designated_individual_note
      licenceStatus: field_hta_licence_status

      relationships {
        field_sector {
          name
        }
        field_related_licences {
          mainLicence: field_satellites_are_linked_to_a
          path {
            alias
          }
          title
        }
        paragraphs: field_add_paragraph {
          type: __typename
          ... on Node {
            ...ParagraphAccordion
            ...ParagraphSimpleText
            ...ParagraphWebform
          }
        }
        licencedActivities: field_main_licence_activities {
          label: name
        }
        field_inspection_report {
          ... on media__inspection_report {
            id
            name
            field_inspection_date(formatString: "D MMM, YYYY")
            relationships {
              field_media_file_1 {
                filename
                uri {
                  url
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`

Establishment.propTypes = {
  data: PropTypes.object.isRequired,
}
