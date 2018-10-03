
const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};


export const truncateAddress = (addr, maxLength) => {
  const { length } = addr;
  if (length <= maxLength) {
    return addr;
  }
  const half = maxLength / 2;
  return `${addr.substring(0, half)}...${addr.substring(length - half - 1, length)}`;
};

export const parseFormType = (formType) => {
  switch (formType) {
    case 'name':
      return 'Name';
    case 'address':
      return 'Address';
    case 'socialId':
      return 'Social ID';
    default:
      return '';
  }
};
