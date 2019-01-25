import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';

class NotFound extends React.Component<RouteComponentProps> {
  render() {
    const { history } = this.props;
    const shouldRenderSidebarFromHistory = !history.location.pathname.includes('onboarding');
    if (shouldRenderSidebarFromHistory) {
      return (
        <h1 style={{ margin: '2em', width: '100%', textAlign: 'center', }}>Coming Soon!</h1>
      );
    }
    return null;
  }
}

export default withRouter(NotFound);
