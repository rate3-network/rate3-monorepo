import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { COLORS, SIDEBAR } from '../../constants/colors';
import classnames from 'classnames';
const styles = createStyles({
  root: {
    display: 'grid',
    gridTemplateAreas: `
      'logo value'
      'logo blockchain'`,
    gridGap: 0,
    gridTemplateColumns: '1fr 3fr',
    color: 'white',
    borderRadius: '10px',
  },
  eth: {
    backgroundColor: SIDEBAR.ETH_CARD.bg,
  },
  stellar: {
    backgroundColor: SIDEBAR.STELLAR_CARD.bg,
  },
  logo: {
    gridArea: 'logo',
  },
  value: {
    gridArea: 'value',
  },
  blockchain: {
    gridArea: 'blockchain',
  },
});

interface IProps {
  type: 'eth' | 'stellar';
  value: string;
}
type IPropsFinal = WithStyles<typeof styles> & IProps;
class SwapDetailsPage extends React.PureComponent<IPropsFinal> {
  render() {
    console.log('swap page rendered');
    const { classes, type, value } = this.props;
    return (
      <div
        className={classnames(
          classes.root,
          { [classes.eth]: type === 'eth' },
          { [classes.stellar]: type === 'stellar' }
        )}
      >
        <div className={classes.logo}>
          Logo
        </div>
        <div className={classes.value}>
          {value} SGDR
        </div>
        <div className={classes.blockchain}>
          {type === 'eth' ? 'Ethereum Blockchain' : 'Stellar Blockchain'}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SwapDetailsPage);
