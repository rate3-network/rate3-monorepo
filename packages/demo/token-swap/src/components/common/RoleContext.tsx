import * as React from 'react';
enum ROLES {
  USER,
  ISSUER,
}
const RoleContext = React.createContext({
  theme: ROLES.USER,
  setTheme: () => { console.log(); },
});

export default RoleContext;
