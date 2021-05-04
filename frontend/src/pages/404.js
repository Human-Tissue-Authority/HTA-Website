import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import Title from "../components/content/title"
import CMS from "../components/content/cms"
import InThisSection from "../components/navigation/inThisSection"

const NotFoundPage = () => {

  const body = "Please note that this is a private beta site currently being tested by the HTA and does not contain all our corporate content. For all wider content please visit <a href='https://www.hta.gov.uk/'>https://www.hta.gov.uk/</a>"

  return (
    <Layout>
      <SEO title="404: Not found"/>

      <Breadcrumbs currentTitle="NOT FOUND"/>
      <Title title="NOT FOUND"/>
      <CMS content={body}/>
    </Layout>
  )
}

export default NotFoundPage
