import Language from '../../models/Language';
import Translation from '../../models/Translation';

// Import translated resources
import approval from './approval';
import navigator from './navigator';
import tokenization from './tokenization';
import transactions from './transactions';
import wallet from './wallet';
import withdrawal from './withdrawal';

const en = new Translation(
  new Language('EN', 'en'),
  {
    approval,
    navigator,
    tokenization,
    transactions,
    wallet,
    withdrawal,
  },
);

export default en;
