module.exports = {
  splitAlias: (alias, currentTitle) => {
    const path = alias

    if (path) {
      const links = path.substr(1).split('/')
      const crumbs = links.map((link, i) => {
        const linkAlias = link.split('-').join(' ')
  
        return {
          path: `/${links.slice(0, i + 1).join('/')}`,
          label: linkAlias[0].toUpperCase() + linkAlias.substring(1)
        }
      })
  
      // add home link to the beginning
      crumbs.unshift({
        path: '/',
        label: 'Home'
      })
  
      // remove link from last item as thats the current page
      crumbs[crumbs.length - 1] = {
        path: null,
        label: currentTitle
      }
  
      return crumbs
    }

    return []
  },

  determineColumnClasses: (paragraphType, fullWidthPage, mode) => {
    const columnClassesEachParagraph = {
      paragraph__simple_text: {
        thin: 'is-6 is-offset-1',
        wide: 'is-9 is-offset-1',
        thinFullWidth: 'is-6 is-offset-3',
        wideFullWidth: 'is-8 is-offset-2'
      },
      paragraph__links_section: {
        thin: 'is-6 is-offset-1',
        wide: 'is-9 is-offset-1',
        thinFullWidth: 'is-8 is-offset-2',
        wideFullWidth: 'is-12'
      },
      paragraph__text_with_background: {
        wide: 'is-10 is-offset-2',
        wideFullWidth: 'is-12'
      },
      paragraph__promotional_blocks: {
        thin: 'is-6 is-offset-1',
        wide: 'is-9 is-offset-1',
        thinFullWidth: 'is-8 is-offset-2',
        wideFullWidth: 'is-12'
      },
      paragraph__image_gallery: {
        thin: 'is-6 is-offset-1',
        wide: 'is-12',
        thinFullWidth: 'is-12',
        wideFullWidth: 'is-12'
      }
    }

    const paragraphClasses = columnClassesEachParagraph[paragraphType]

    if (mode === 'Thin' && !fullWidthPage) {
      return paragraphClasses.thin
    } else if (mode === 'Thin' && fullWidthPage) {
      return paragraphClasses.thinFullWidth
    } else if (mode === 'Wide' && !fullWidthPage) {
      return paragraphClasses.wide
    } else if (mode === 'Wide' && fullWidthPage) {
      return paragraphClasses.wideFullWidth
    } else if (!mode && fullWidthPage) {
      return paragraphClasses.wideFullWidth
    } else {
      return paragraphClasses.thin || paragraphClasses.wide
    }
  }
}
