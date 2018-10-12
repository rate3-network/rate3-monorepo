import { isProd } from './Config';

/* eslint-disable no-console */
class GlobalLogger {
  /**
   * Most basic string logging function
   *
   * @param {String} data String to log
   * @returns {void}
   * @memberof GlobalLogger
   */
  log(data) {
    if (isProd) {
      // console.log('Prod: ', data);
    } else {
      console.log('Dev: ', data);
    }
  }

  /**
   * Like log, but error
   *
   * @param {String} data String to log
   * @returns {void}
   * @memberof GlobalLogger
   */
  error(data) {
    if (isProd) {
      // console.log('Prod: ', data);
    } else {
      console.error('Dev: ', data);
    }
  }
}

// Singleton
const singleton = new GlobalLogger();
export default singleton;
