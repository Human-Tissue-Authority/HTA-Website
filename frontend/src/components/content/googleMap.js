import React from 'react'
import { animated, useSpring, config } from 'react-spring'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

const HTAGoogleMap = props => {
  const { lat, long , wide } = props

  const MyMapComponent = withScriptjs(withGoogleMap((props) =>
    <GoogleMap
      defaultZoom={11}
      defaultCenter={{ lat: lat, lng: long }}
    >
      {props.isMarkerShown && <Marker position={{ lat: lat, lng: long }}/>}
    </GoogleMap>
  ))

  const animation = useSpring({
    config: config.gentle,
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay:  500,
  })

  return (
    <animated.div
      style={animation}
      className="section key-information columns map"
    >
      <div className={`key-information__inner-wrapper column ${wide ? 'is-9' : 'is-6'} is-offset-1`}>
        <MyMapComponent
          isMarkerShown
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDjgHRjkWPolSbyNVd-PKRz-jC5BS4y0Ns&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />
      </div>
    </animated.div>
  )
}

export default HTAGoogleMap
