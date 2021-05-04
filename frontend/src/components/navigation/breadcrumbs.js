import React from 'react'
import { useTransition, config } from 'react-spring'
import { splitAlias } from '../../utils/helpers'

import Crumb from './crumb'

const Breadcrumbs = props => {
  const { alias, currentTitle, wide } = props
  const aliasArr = splitAlias(alias, currentTitle)

  const animation = useTransition(aliasArr, item => item.path, {
    unique: true,
    trail: 600 / aliasArr.length,
    config: config.stiff,
    from: { opacity: 0, transform: 'translateX(-10px)' },
    enter: { opacity: 1, transform: 'translateX(0)' },
    delay: 300
  })

  return (
    <div className="breadcrumbs columns">
      <nav aria-label="Breadcrumb" className={`breadcrumbs__inner-wrapper column ${wide ? 'is-9' : 'is-7'}`}>
        <ul>
          {animation.map(({ item, key, props }) => (
            <Crumb key={key} link={item.path} label={item.label} animation={props} />
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Breadcrumbs
