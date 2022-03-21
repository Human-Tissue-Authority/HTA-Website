const path = require(`path`)
const { updatePaths, ensureTrailingSlash } = require('./src/utils')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  const queries = await graphql(`
    query {
      blogs: allNodeBlog {
        edges {
          node {
            id
            path {
              alias
            }
            drupal_internal__nid
          }
          next {
            title
            path {
              alias
            }
          }
          previous {
            title
            path {
              alias
            }
          }
        }
      }

      establishments: allNodeEstablishment {
        nodes {
          id
          path {
            alias
          }
          drupal_internal__nid
        }
      }

      medicalSchools: allNodeMedicalSchool {
        nodes {
          id
          path {
            alias
          }
          drupal_internal__nid
        }
      }

      meetings: allNodeMeeting {
        nodes {
          id
          path {
            alias
          }
          drupal_internal__nid
        }
      }

      news: allNodeArticle(filter: {field_news_type: {eq: "News"}}, sort: {fields: field_date, order: ASC}) {
        edges {
          node {
            id
            path {
              alias
            }
            drupal_internal__nid
          }
          next {
            title
            field_date(formatString: "D MMM, YYYY H:mm")
            path {
              alias
            }
          }
          previous {
            title
            field_date(formatString: "D MMM, YYYY H:mm")
            path {
              alias
            }
          }
        }
      }
      
      events: allNodeArticle(filter: {field_news_type: {eq: "Event"}}, sort: {fields: field_date, order: ASC}) {
        edges {
          node {
            id
            path {
              alias
            }
            drupal_internal__nid
          }
          next {
            title
            field_date(formatString: "D MMM, YYYY H:mm")
            path {
              alias
            }
          }
          previous {
            title
            field_date(formatString: "D MMM, YYYY H:mm")
            path {
              alias
            }
          }
        }
      }

      pages: allNodePage {
        nodes {
          id
          path {
            alias
          }
          drupal_internal__nid
        }
      }

      vacancies: allNodeVacancy(sort: {fields: field_date, order: ASC}) {
        edges {
          node {
            id
            path {
              alias
            }
            drupal_internal__nid
          }
          next {
            title
            field_date(formatString: "D MMM, YYYY H:mm")
            path {
              alias
            }
          }
          previous {
            title
            field_date(formatString: "D MMM, YYYY H:mm")
            path {
              alias
            }
          }
        }
      }
      
      redirects: allRedirectRedirect {
        edges {
          node {
            redirect_source {
              path
            }
            redirect_redirect {
              uri
              url
            }
            status_code
          }
        }
      }
    }
  `)

  const {
    blogs,
    establishments,
    medicalSchools,
    meetings,
    news,
    events,
    pages,
    vacancies,
    redirects,
  } = queries.data

  const data = {
    data: {
      blogs,
      establishments,
      medicalSchools,
      meetings,
      news,
      events,
      pages,
      vacancies,
      redirects
    }
  }

  const updatedRedirects = await updatePaths(data)

  blogs.edges.map(({node, previous, next}) => {
    createPage({
      path: ensureTrailingSlash(node),
      component: path.resolve(`./src/templates/blog.js`),
      context: {
        BlogId: node.id,
        NodeId: `${node.drupal_internal__nid}`,
        next,
        previous
      },
    })
  })

  establishments.nodes.map(data => {
    createPage({
      path: ensureTrailingSlash(data),
      component: path.resolve(`./src/templates/establishment.js`),
      context: {
        EstablishmentId: data.id,
      },
    })
  })

  medicalSchools.nodes.map(data => {
    createPage({
      path: ensureTrailingSlash(data),
      component: path.resolve(`./src/templates/medicalSchool.js`),
      context: {
        MedicalSchoolId: data.id,
      },
    })
  })

  meetings.nodes.map(data => {
    createPage({
      path: ensureTrailingSlash(data),
      component: path.resolve(`./src/templates/meeting.js`),
      context: {
        MeetingId: data.id,
      },
    })
  })

  news.edges.map(({ node, previous, next }) => {
    createPage({
      path: ensureTrailingSlash(node),
      component: path.resolve(`./src/templates/news.js`),
      context: {
        ArticleId: node.id,
        NodeId: `${node.drupal_internal__nid}`,
        next,
        previous
      },
    })
  })

  events.edges.map(({ node, previous, next }) => {
    createPage({
      path: ensureTrailingSlash(node),
      component: path.resolve(`./src/templates/events.js`),
      context: {
        ArticleId: node.id,
        NodeId: `${node.drupal_internal__nid}`,
        next,
        previous
      },
    })
  })

  pages.nodes.map(data => {
    createPage({
      path: ensureTrailingSlash(data),
      component: path.resolve(`./src/templates/page.js`),
      context: {
        PageId: data.id,
        NodeId: `${data.drupal_internal__nid}`
      },
    })
  })

  vacancies.edges.map(({ node, previous, next }) => {
    createPage({
      path: ensureTrailingSlash(node),
      component: path.resolve(`./src/templates/vacancy.js`),
      context: {
        VacancyId: node.id,
        NodeId: `${data.drupal_internal__nid}`,
        next,
        previous
      },
    })
  })

  updatedRedirects.edges.map(redirect => {
    if (redirect.node.redirect_source && redirect.node.redirect_source.path) {
      createRedirect({
        fromPath: `/${redirect.node.redirect_source.path}`,
        toPath: redirect.node.redirect_redirect.url,
        statusCode: redirect.node.status_code,
        redirectInBrowser: true,
        isPermanent: true
      })
    }
  })
}
