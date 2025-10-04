import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '42px',
    borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#6366f1' : '#9ca3af',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '8px 12px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: '8px',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
      ? '#f3f4f6'
      : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#6366f1' : '#f3f4f6',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e0e7ff',
    borderRadius: '6px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#3730a3',
    fontSize: '14px',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#3730a3',
    '&:hover': {
      backgroundColor: '#c7d2fe',
      color: '#1e1b4b',
    },
  }),
};

const darkStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '42px',
    backgroundColor: '#374151',
    borderColor: state.isFocused ? '#6366f1' : '#4b5563',
    color: '#f9fafb',
    boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#6366f1' : '#6b7280',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '8px 12px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px',
    color: '#f9fafb',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#f9fafb',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: '8px',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
      ? '#4b5563'
      : '#374151',
    color: state.isSelected ? 'white' : '#f9fafb',
    '&:hover': {
      backgroundColor: state.isSelected ? '#6366f1' : '#4b5563',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#1e3a8a',
    borderRadius: '6px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#dbeafe',
    fontSize: '14px',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#dbeafe',
    '&:hover': {
      backgroundColor: '#1e40af',
      color: '#ffffff',
    },
  }),
};

export default function CustomSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  isMulti = false, 
  isSearchable = true, 
  isClearable = true,
  isDisabled = false,
  className = "",
  darkMode = false,
  ...props 
}) {
  const handleChange = (selectedOption) => {
    if (isMulti) {
      onChange(selectedOption ? selectedOption.map(option => option.value) : []);
    } else {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const getValue = () => {
    if (isMulti) {
      return options.filter(option => value?.includes(option.value)) || [];
    } else {
      return options.find(option => option.value === value) || null;
    }
  };

  return (
    <div className={className}>
      <Select
        options={options}
        value={getValue()}
        onChange={handleChange}
        placeholder={placeholder}
        isMulti={isMulti}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        styles={darkMode ? darkStyles : customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        {...props}
      />
    </div>
  );
}
