export const genStyle = (name, styleFn) => ({
  [`user${capitalize(name)}`]: styleFn(true),
  [`trustee${capitalize(name)}`]: styleFn(false),
});

export const getClass = (classes, name, isUser) => (
  classes[`${isUser ? 'user' : 'trustee'}${capitalize(name)}`]
);
const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const hashCode = (s) => {
  let ans = s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
  return Math.abs(ans);              
};

export const getRandomColor = (s) => {
  const letters = '0123456789ABCDEF';
  const hash = hashCode(s);
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[hash.toString().charAt(i)];
  }
  return color;
};

export { b64Md5 } from './md5';


export const truncateAddress = (addr, maxLength) => {
  const { length } = addr;
  if (length <= maxLength) {
    return addr;
  }
  const half = maxLength / 2;
  return `${addr.substring(0, half)}...${addr.substring(length - half - 1, length - 1)}`;
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
