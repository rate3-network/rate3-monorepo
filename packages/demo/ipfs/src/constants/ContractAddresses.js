import { isProd } from '../global/Config';

export const ipfsDocAddr = isProd
  ? '0x708bbbb7346a4e26b3a57fde5f36a991ca98d5e2'
  : '';
export const docHistoryAddr = isProd
  ? '0x0c1836a462682eb2b5552c541ea3fbd2fa3ed853'
  : '';
