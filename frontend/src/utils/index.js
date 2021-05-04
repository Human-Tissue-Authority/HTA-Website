module.exports = {
  ensureTrailingSlash: data => {
    const alias = data.path.alias

    if (alias) {
      // temporarily remove trailing slash from end of string ("/") - #175244569
      return alias.endsWith('/') ? alias : `${alias}/`
    }

    return `/node/${data.drupal_internal__nid}/`
  },

  updatePaths: json => {
    return new Promise((resolve, reject) => {
      return [json.data].map(({
        blogs,
        establishments,
        medicalSchools,
        meetings,
        news,
        events,
        pages,
        vacancies,
        redirects
      }) => {
          if (
            !blogs ||
            !establishments ||
            !medicalSchools ||
            !meetings ||
            !news.edges ||
            !events.edges ||
            !pages ||
            !vacancies.edges ||
            !redirects
          ) {
            const error = new Error('missing dependency')
            
            reject(error)
            throw error
          }

          const blogNodes = blogs.edges
          const establishmentNodes = establishments.nodes
          const medicalSchoolNodes = medicalSchools.nodes
          const meetingNodes = meetings.nodes
          const newsNodes = news.edges
          const eventsNodes = events.edges
          const pageNodes = pages.nodes
          const vacancyNodes = vacancies.edges

          const updatedRedirects = []
          const nodeArray = blogNodes.concat(
            establishmentNodes,
            medicalSchoolNodes,
            meetingNodes,
            newsNodes,
            eventsNodes,
            pageNodes,
            vacancyNodes
          )

          redirects.edges.forEach(({ node }) => {
            if (node.redirect_redirect.uri.indexOf('/node/') !== -1) {
              const nid = node.redirect_redirect.uri.replace( 'internal:/node/', '')
              
              nodeArray.forEach(value => {
                if (Number(nid) === value.drupal_internal__nid) {
                  node.redirect_redirect.uri = value.path.alias
                }
              })
            }

            updatedRedirects.push({
              node,
            })
          })

          redirects.edges = updatedRedirects

          resolve(redirects)
          return redirects
        }
      )
    })
  },
}
