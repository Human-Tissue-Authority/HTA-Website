import React, { useEffect } from "react"
import { useLocation } from "@reach/router"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Breadcrumbs from "../components/navigation/breadcrumbs"
import Title from "../components/content/title"
import CMS from "../components/content/cms"
import { fetchAuthed } from "../utils/utils"

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location && location?.pathname) {
      fetchAuthed(`${process.env.API_ROOT}/bbd_custom_rest_api/page-not-found-logger?path=${location.pathname}`);
    }
  }, [location]);

  const body = `
    If you typed the web address, check it is correct.<br><br>
    If you pasted the web address, check you copied the entire address.<br><br>
    If the web address is correct, or you selected a link or button, <a href="/make-an-enquiry">please contact us</a> and we will try and resolve your issue as soon as possible.<br><br>
    We recently launched the beta version of our new website, which means some old links may no longer be working. You can <a href="https://archive.hta.gov.uk/ ">access our old website</a> and search for it there.
  `

  return (
    <Layout>
      <SEO title="404: Not found"/>

      <Breadcrumbs currentTitle="Page not found"/>
      <Title title="Page not found"/>
      <CMS content={body}/>
    </Layout>
  )
}

export default NotFoundPage
