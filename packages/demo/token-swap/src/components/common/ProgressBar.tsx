// tslint:disable:max-line-length
import * as React from 'react';
import './ProgressBar.css';

interface IProps {
  progress: number;
}

class ProgressBar extends React.Component<IProps> {
  render() {
    return (
      <div className="progress progress-striped active">
        <div
          role="progressbar progress-striped"
          style={{ width: `${this.props.progress}%` }}
          className="progress-bar"
        >
          <span className="empty">{' '}</span>
        </div>
      </div>
    );
  }
}

export default ProgressBar;
