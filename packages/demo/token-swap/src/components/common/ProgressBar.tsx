// tslint:disable:max-line-length
import * as React from 'react';
import './ProgressBar.css';

interface IProps {
  progress: number;
}

class ProgressBar extends React.Component<IProps> {
  render() {
    return (
      <>
      {this.props.progress === 100 ?
        <div className="progress">
          <div
            role="progressbar"
            style={{ width: `${this.props.progress}%` }}
            className="progress-bar-finished"
          >
            <span className="empty">{' '}</span>
          </div>
        </div>
      :
        <div className="progress progress-striped active">
          <div
            role="progressbar progress-striped"
            style={{ width: `${this.props.progress}%` }}
            className="progress-bar"
          >
            <span className="empty">{' '}</span>
          </div>
        </div>
      }
      </>
    );
  }
}

export default ProgressBar;
