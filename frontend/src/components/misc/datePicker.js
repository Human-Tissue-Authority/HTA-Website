import dayjs from "dayjs"
import React from "react"
import { default as ReactDatePicker } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
        <svg className={CUSTOM_CLASS_NAME + '__field-indicator'} height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>
      </div>
      <div onChange={onChange} className={CUSTOM_CLASS_NAME + '__field'} onClick={onClick}>
        {showPlaceholder ? 'Select date' : dateString}
      </div>
      {!showPlaceholder && onClearField && <span className={CUSTOM_CLASS_NAME + '__field-clear-btn'} onClick={onClearField}>&#x2715;</span>}
    </div>
  )

}

export default DatePicker
