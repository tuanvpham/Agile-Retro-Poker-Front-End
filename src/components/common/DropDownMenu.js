// App.js

import React from "react";
import Select from "react-select";

import classnames from "classnames";
import PropTypes from "prop-types";

const options = [
  {
    value: "fib",
    label: "Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, Pass, Coffee )"
  },
  {
    value: "modfib",
    label:
      "Modified Fibonacci ( 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, Pass, Coffee )"
  },
  {
    value: "seq",
    label: "Sequential ( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ?, Pass, Coffee )"
  }
];

/*class DropDownMenu extends React.Component {
  state = {
    selectedOption: null
  };
  handleChange = selectedOption => {
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
  };
  render() {
    const { selectedOption } = this.state;
*/

const DropDownMenu = ({
  name,
  placeholder,
  value,
  onChange,
  disabled,
  multiline
}) => {
  return (
    <div>
      <label>Card Deck</label>
      <Select name={name} value={value} onChange={onChange} options={options} />
    </div>
  );
};

DropDownMenu.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  info: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.string,
  multiline: PropTypes.string
};

DropDownMenu.defaultProps = {
  type: "text"
};

export default DropDownMenu;
