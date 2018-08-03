import React from 'react';

export const Web3Context = Object.defineProperty(
  React.createContext(),
  'name',
  {
    value: 'web3',
    writable: false,
  },
);
export const EventsContext = Object.defineProperty(
  React.createContext(),
  'name',
  {
    value: 'events',
    writable: false,
  },
);
export const DocTypesContext = Object.defineProperty(
  React.createContext(),
  'name',
  {
    value: 'docTypes',
    writable: false,
  },
);

export const withContext = (...ContextList) => Component => (props) => {
  const [Context, ...rest] = ContextList;
  if (!Context) {
    return <Component {...props} />;
  }
  return (
    <Context.Consumer>
      {value => withContext(...rest)(Component)({ ...props, [Context.name]: value })}
    </Context.Consumer>
  );
};
