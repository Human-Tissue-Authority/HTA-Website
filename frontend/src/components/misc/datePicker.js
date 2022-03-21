import dayjs from "dayjs"
import React from "react"
import { default as ReactDatePicker } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import FilterArrow from '../../images/filter-arrow.svg'

const CUSTOM_CLASS_NAME = 'date-picker'

const DatePicker = props => {
  return (
    <ReactDatePicker 
      {...props}
      customInput={<DateRange {...props} />}
      className={CUSTOM_CLASS_NAME} 
      popperClassName={CUSTOM_CLASS_NAME + '__popper-styles'}
      calendarClassName={CUSTOM_CLASS_NAME + '__container'} 
      showPopperArrow={false} 
    />
  )
}

const DateRange = ({ onChange, showPlaceholder, onClearField, onClick, value, endDate }) => {
  const startDateFormat = dayjs(value).format('D MMM YY')
  const endDateFormat = endDate ? dayjs(endDate).format('D MMM YY') : null
  let dateString
  
  if ( startDateFormat === endDateFormat || !endDateFormat ) {
    dateString = startDateFormat
  } else {
    dateString = startDateFormat + ' - ' + endDateFormat
  }

  return (
    <div className={CUSTOM_CLASS_NAME + '__field-wrapper'}>
      <div className={CUSTOM_CLASS_NAME + '__field-indicator-wrapper'} onClick={onClick}>
        <img src={FilterArrow} role="presentation" aria-hidden alt="" />
      </div>
      <div onChange={onChange} className={CUSTOM_CLASS_NAME + '__field'} onClick={onClick}>
        {showPlaceholder ? 'Select date' : dateString}
      </div>
      {!showPlaceholder && onClearField && <span className={CUSTOM_CLASS_NAME + '__field-clear-btn'} onClick={onClearField}>&#x2715;</span>}
    </div>
  )

}

export default DatePicker
