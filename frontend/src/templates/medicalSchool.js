import React from "react"
import PropTypes from "prop-types"
import { graphql, Link } from "gatsby"
import "../scss/main.scss"

import paragraphHelper from "../components/helpers/paragraphHelper"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import LastUpdated from "../components/content/lastUpdated"
import Title from "../components/content/title"
import KeyInformation from "../components/content/keyInformation"
import CMS from "../components/content/cms"
import GoogleMap from "../components/content/googleMap"
import {animated, config, useSpring} from "react-spring"
import ArrowPurple from "../images/arrow-purple.svg"
import MedicalSchoolInformation from "../components/content/medicalSchoolInformation"

const MedicalSchool = ({ data }) => {
  const { nodeMedicalSchool } = data

  const animationAside = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 }
  })

  const contactInformation = [
    {
      label: 'Contact',
      value: nodeMedicalSchool.field_contact_name
    },
    {
      label: 'Telephone number',
      value: nodeMedicalSchool.field_contact_telephone
    },
    {
      label: 'Email',
      value: nodeMedicalSchool.field_email_address,
      wide: true
    }
  ]

  const paragraphs = paragraphHelper(nodeMedicalSchool.relationships.paragraphs)

  const areasCovered = nodeMedicalSchool.relationships.field_areas_covered.map(item =>
    <span> {item.label}</span>
  )

  const license_number = nodeMedicalSchool.relationships.field_establishment ? <Link to={nodeMedicalSchool.relationships.field_establishment.path.alias}>{nodeMedicalSchool.relationships.field_establishment.field_main_licence_number}</Link> : ''

  return (
    <Layout withSectionOverlay>
      <SEO title={`${nodeMedicalSchool.title} | Medical School`} />
      <Breadcrumbs alias={nodeMedicalSchool.path.alias} currentTitle={nodeMedicalSchool.title} />

      <LastUpdated timestamp={nodeMedicalSchool.changed} />

      <Title title={nodeMedicalSchool.title} />

      <KeyInformation items={contactInformation} title="Key Contacts"/>

      <MedicalSchoolInformation
        address={nodeMedicalSchool.field_address_formatted}
        areas_covered={areasCovered}
        licence_number={license_number}
        website={nodeMedicalSchool.field_website_address.url}/>

      <GoogleMap lat={nodeMedicalSchool.field_address.lat} long={nodeMedicalSchool.field_address.lon} />

      <CMS content={nodeMedicalSchool.body?.processed} />

      {paragraphs}

      <div className="section--overlay">
        <div className="section--overlay--wrapper columns is-multiline">
          <animated.div
            style={animationAside}
            className="in-this-section column is-4"
          >
            <div className="in-this-section__inner-wrapper">
              <Link to="/medical-schools">
                <img src={ArrowPurple} role="presentation" aria-hidden alt="" />
                Back to medical schools
              </Link>
            </div>

          </animated.div>
        </div>
      </div>

    </Layout>
  )
}

export default MedicalSchool

export const query = graphql`
  query($MedicalSchoolId: String!) {
    nodeMedicalSchool(id: { eq: $MedicalSchoolId }) {
      body {
        processed
      }
      path {
        alias
      }
      title
      changed(formatString: "DD MMM Y")
      field_contact_name
      field_contact_telephone
      field_email_address
      field_address {
        bottom
        geo_type
        geohash
        lat
        latlon
        left
        lon
        right
        top
        value
      }
      relationships {
        paragraphs: field_add_paragraph {
          type: __typename
          ... on Node {
            ...ParagraphAccordion
            ...ParagraphSimpleText
          }
        }
        field_areas_covered {
          label: name
        }
        field_establishment {
          field_main_licence_number
          path {
            alias
          }
        }
      }
      field_address_formatted
      field_website_address {
        url
      }
    }
  }
`

MedicalSchool.propTypes = {
  data: PropTypes.object.isRequired,
}
