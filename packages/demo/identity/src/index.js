import React from 'react';
import ReactDOM from 'react-dom';

import { mobileAndTabletcheck } from './utils/mobileCheck';
import MobileFallback from './pages/MobileFallback';
// import './index.css';
import App from './App';

ReactDOM.render(mobileAndTabletcheck() ? <MobileFallback /> : <App />, document.getElementById('root'));

