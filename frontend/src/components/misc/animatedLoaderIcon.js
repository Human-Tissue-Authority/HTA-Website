// source: https://loading.io/css/
import React from 'react'

const AnimatedLoaderIcon = props => {
  const { colorOverride } = props

  return (
    <div className="lds-ellipsis">
      {[...Array(4)].map(() => <div style={{ backgroundColor: colorOverride || '#fff' }}/>)}
    </div>
  )
}

export default AnimatedLoaderIcon

