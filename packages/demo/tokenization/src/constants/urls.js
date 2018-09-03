export const rootPath = '/';
export const faqPath = '/faq';
export const tokenizePath = '/user/tokenization';
export const withdrawPath = '/user/withdrawal';
export const userTransactionsPath = '/user/transactions';
export const userWalletSettingsPath = '/user/wallet';
export const approvePath = '/trustee/approval';
export const finalizePath = '/trustee/finalize';
export const trusteeTransactionsPath = '/trustee/transactions';
export const trusteeWalletSettingsPath = '/trustee/wallet';

const userPaths = {
  [tokenizePath]: null,
  [withdrawPath]: null,
  [userTransactionsPath]: null,
  [userWalletSettingsPath]: null,
};

const trusteePaths = { // eslint-disable-line no-unused-vars
  [approvePath]: null,
  [finalizePath]: null,
  [trusteeTransactionsPath]: null,
  [trusteeWalletSettingsPath]: null,
};

const switchRolePathMappings = {
  [userTransactionsPath]: trusteeTransactionsPath,
  [trusteeTransactionsPath]: userTransactionsPath,
  [userWalletSettingsPath]: trusteeWalletSettingsPath,
  [trusteeWalletSettingsPath]: userWalletSettingsPath,
};
export const getSwitchedRolePath = (currentPath) => {
  if (Object.prototype.hasOwnProperty.call(switchRolePathMappings, currentPath)) {
    return switchRolePathMappings[currentPath];
  }
  if (Object.prototype.hasOwnProperty.call(userPaths, currentPath)) {
    return approvePath;
  }
  return tokenizePath;
};
