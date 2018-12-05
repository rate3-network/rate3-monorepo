import * as React from 'react';
import Switch from '@material-ui/core/Switch';
import RoleContext from './RoleContext';
import { ROLES } from 'src/constants/general';

export default class RoleSwitch extends React.Component {
  static contextType = RoleContext;
  toggle = () => {
    this.context.setTheme(this.context.theme === ROLES.ISSUER ? ROLES.ISSUER : ROLES.USER);
  }

  render() {
    // console.log('conteDDDxt', this.context);
    return (
      <div>
        {this.context.theme === ROLES.ISSUER ? 'issuer' : 'user'}
        <Switch
          checked={this.context.theme === ROLES.ISSUER}
          onChange={() => {
            this.context.setTheme(this.context.theme === ROLES.ISSUER ? ROLES.USER : ROLES.ISSUER);
          }}
        />
      </div>
    );
  }
}
