const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#f3f4f6' : '#ffffff',
        borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
        color: '#1f2937',
        '&:hover': {
            borderColor: '#2563eb',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#2563eb' : '#ffffff',
        color: state.isFocused ? '#ffffff' : '#1f2937',
        '&:hover': {
            backgroundColor: '#2563eb',
            color: '#ffffff',
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#1f2937',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#e5e7eb',
        color: '#1f2937',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#1f2937',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#9ca3af',
        ':hover': {
            backgroundColor: '#f3f4f6',
            color: '#2563eb',
        },
    }),
};

export default customSelectStyles;