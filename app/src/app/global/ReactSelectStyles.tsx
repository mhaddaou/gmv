export const ReactSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    fontSize: '1rem',
    fontWeight: 'bold',
    backgroundColor: 'var(--bs-gray-100)',
    borderColor: 'var(--bs-gray-100)',
    boxShadow: 'none',
    padding: '0.3rem 0.7rem',
    color: 'var(--bs-gray-700) !important',

    '&:hover': {
      borderColor: 'none',
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'var(--bs-gray-700) !important',
    backgroundColor: state.isSelected ? 'var(--bs-gray-300)' : 'var(--bs-gray-100)',
    '&:hover': {
      backgroundColor: state.isSelected ? 'var(--bs-gray-300)' : 'var(--bs-gray-200)',
    },
  }),
  singleValue: (provided: any, state: any) => {
    const color = 'var(--bs-gray-500) !important'
    return {...provided, color}
  },
}
export const ReactSelectStyles2 = {
  control: (provided: any, state: any) => ({
    ...provided,
    fontSize: '0.89rem',
    fontWeight: 'bold',
    backgroundColor: 'var(--bs-gray-100)',
    borderColor: 'transparent', // Change border color to transparent
    borderRadius: '5rem',
    boxShadow: 'none',
    padding: '0.85rem 0.7rem',
    '&:hover': {
      borderColor: 'transparent', // Ensure hover state also has no border
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'var(--bs-gray-600) !important',
    backgroundColor: state.isSelected ? 'var(--bs-gray-300)' : 'var(--bs-gray-100)',
    '&:hover': {
      backgroundColor: state.isSelected ? 'var(--bs-gray-300)' : 'var(--bs-gray-200)',
    },
  }),
  singleValue: (provided: any, state: any) => {
    const color = 'var(--bs-gray-500) !important';
    return { ...provided, color };
  },

  // Uncomment if you want to hide the dropdown indicator
  // dropdownIndicator: (provided: any) => ({
  //   ...provided,
  //   display: 'none', // Hide the dropdown indicator
  // }),
};

