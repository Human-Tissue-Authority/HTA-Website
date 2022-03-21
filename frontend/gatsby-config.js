require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

const { API_ROOT, AUTH_USER, AUTH_PASS } = process.env

console.log('API ROOT: ', API_ROOT)

module.exports = {
  siteMetadata: {
    siteUrl: `https://www.hta.gov.uk`,
    title: `Human Tissue Authority`,
    description: `The HTA is a regulator set up in 2005 following events in the 1990s that revealed a culture in hospitals of removing and retaining human organs and tissue without consent. `,
    author: `Big Blue Door Ltd - bigbluedoor.net`,
  },
  plugins: [
    `gatsby-plugin-remove-trailing-slashes`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: "gatsby-source-drupal",
      concurrentFileRequests: 50,
      options: {
        baseUrl: API_ROOT,
        basicAuth: {
          username: AUTH_USER,
          password: AUTH_PASS
        },
        fastBuilds: true
      },
    },
    {
      resolve: `gatsby-source-drupal-menu-links`,
      options: {
        baseUrl: API_ROOT,
        basicAuth: {
          username: AUTH_USER,
          password: AUTH_PASS
        },
        menus: ['main', 'footer', 'big-footer'],
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-plugin-sass`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-webfonts`,
      options: {
        fonts: {
          google: [
            {
              family: "Source Sans Pro",
              variants: ['300', '400', '400i', '600', '700', '700i']
            },
            {
              family: "Bitter",
              variants: ['300', '400', '600', '700']
            }
          ]
        }
      }
    },
  ],
}
