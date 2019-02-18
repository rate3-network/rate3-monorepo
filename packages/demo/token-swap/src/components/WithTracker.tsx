import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ReactGa from 'react-ga';
import { TRACKING_ID } from '../constants/defaults';


ReactGa.initialize(TRACKING_ID);

const withTracker = (WrappedComponent) => {
  const trackPage = (page) => {
    ReactGa.set({ page });
    ReactGa.pageview(page);
    console.log('tracking');
  };

  const HOC = class extends React.Component {
    componentDidMount() {
      const props = this.props as any;
      console.log(this.props);
      const page = props.location.pathname;
      trackPage(page);
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC as any;
};
export default withTracker;
