import React from 'react';
import PropTypes from 'prop-types';

class OnboardingFlow extends React.Component {
  state = {
    currentStep: 0,
    context: {},
  }

  componentDidMount() {
    const { context } = this.props;
    this.setState({ context });
  }

  getChildren() {
    const { children } = this.props;

    if (typeof children === 'function') {
      return [children];
    }

    if (typeof children !== 'object') {
      return [];
    }

    // Check if array of nodes
    if (Object.prototype.hasOwnProperty.call(children, 'length')) {
      return children;
    }

    return [children];
  }

  setContext = (reducer) => {
    this.setState(state => ({ ...state, context: reducer(state.context) }));
  }

  handleNextStep = () => {
    const { onComplete } = this.props;
    const { currentStep, context } = this.state;
    const children = this.getChildren();

    if (currentStep === children.length - 1) {
      onComplete(context);
      return;
    }

    this.setState(state => ({ ...state, currentStep: state.currentStep + 1 }));
  }

  handlePrevStep = () => {
    const { handlePrevStep } = this.props;
    const { currentStep } = this.state;

    if (currentStep === 0) {
      if (handlePrevStep != null) handlePrevStep();
      return;
    }

    this.setState(state => ({ ...state, currentStep: state.currentStep - 1 }));
  }

  render() {
    const children = this.getChildren();
    const { currentStep, context } = this.state;

    if (!children.length) {
      return null;
    }

    const currentChild = (typeof children[currentStep] === 'function')
      ? children[currentStep](context) : children[currentStep];

    const childProps = {};
    if (currentChild.type === OnboardingFlow) {
      childProps.handlePrevStep = this.handlePrevStep;
      childProps.onComplete = this.handleNextStep;
      childProps.context = { ...context };
    } else {
      childProps.handlePrevStep = this.handlePrevStep;
      childProps.handleNextStep = this.handleNextStep;
      childProps.setContext = this.setContext;
    }

    return React.cloneElement(currentChild, childProps);
  }
}

OnboardingFlow.propTypes = {
  context: PropTypes.object,
  handlePrevStep: PropTypes.func, // only if onboarding flow is nested
  onComplete: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ])),
  ]).isRequired,
};

OnboardingFlow.defaultProps = {
  context: {},
  onComplete: () => false,
  handlePrevStep: null,
};

export default OnboardingFlow;
