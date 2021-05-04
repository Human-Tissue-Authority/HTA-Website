import React from 'react'
import { animated, useSpring, config } from 'react-spring'
import Button from "../misc/button";

const medicalSchoolInformation = props => {
  const { address, areas_covered, licence_number, website, wide } = props

  return (
    <animated.section
      className="section medical-school-information columns"
    >
      <div className={`column ${wide ? 'is-9' : 'is-6'} is-offset-1`}>
        <div className="columns">
          <div className={`column is-6`}>
            <h2 className="h section-title">Address</h2>
            <div className={`is-6 info-column`}>
              <p>{address}</p>
            </div>

            <Button
              text="Visit website"
              ariaText="Visit website"
              link={website}
              showArrow
            />
          </div>

          <div className={`column is-6`}>
            <h2 className="h section-title">Further information</h2>
            <div className={`is-6 further__information`}>
              <p>Postcodes covered: {areas_covered}</p>
              {licence_number ? <p>View this medical school's HTA licence: {licence_number}</p>: ''}
            </div>
          </div>
        </div>
      </div>
    </animated.section>
  )
}

export default medicalSchoolInformation
