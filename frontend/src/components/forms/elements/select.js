import React from 'react'
import ReactSelect, { components } from 'react-select'

const Option = props => {
  const innerProps = { ...props.innerProps, role: 'option', 'aria-disabled': props.isDisabled };
  return <components.Option {...props} innerProps={innerProps} />
}

const MenuList = props => {
  const innerProps = { ...props.innerProps, id: props.selectProps.menuId, role: 'listbox', 'aria-expanded': true };
  return <components.MenuList {...props} innerProps={innerProps} />
}

const Select = props => {
  return (
    <ReactSelect
      components={{ Option, MenuList }}
      {...props}
    />
  )
}

export default Select
