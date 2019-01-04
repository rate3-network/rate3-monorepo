import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { COLORS, SIDEBAR } from '../../constants/colors';
import classnames from 'classnames';
import ethSGDRSvg from '../../assets/ethSGDR.svg';
import stellarSGDRSvg from '../../assets/stellarSGDR.svg';

const styles = createStyles({
  root: {
    padding: '0.2em 0.1em 0.2em 0.3em',
    display: 'grid',
    width: '11em',
    height: '2.8em',
    gridTemplateAreas: `
      'logo value'
      'logo blockchain'`,
    gridGap: '0.1em',
    gridTemplateColumns: '1fr 4fr',
    color: 'white',
    borderRadius: '0.2rem',
  },
  noPadding: {
    padding: 0,
  },
  eth: {
    backgroundColor: SIDEBAR.ETH_CARD.bg,
  },
  stellar: {
    backgroundColor: SIDEBAR.STELLAR_CARD.bg,
  },
  logo: {
    gridArea: 'logo',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    gridArea: 'value',
  },
  blockchain: {
    gridArea: 'blockchain',
    fontSize: '0.9em',
  },
});

interface IProps {
  type: 'eth' | 'stellar';
  value: string;
  noPadding?: boolean;
}
type IPropsFinal = WithStyles<typeof styles> & IProps;
class SwapDetailsPage extends React.PureComponent<IPropsFinal> {
  static defaultProps = {
    noPadding: false,
  };
  render() {
    console.log('swap page rendered');
    const { classes, type, value, noPadding } = this.props;
    return (
      <div
        className={classnames(
          classes.root,
          { [classes.eth]: type === 'eth' },
          { [classes.stellar]: type === 'stellar' },
          { [classes.noPadding]: noPadding }
        )}
      >
        <div className={classes.logo}>
          {type === 'eth' ?
            <img height="38px" draggable={false} src={ethSGDRSvg} alt="eth sgdr"/>
            :
            <img height="38px" draggable={false} src={stellarSGDRSvg} alt="stellar sgdr"/>
          }
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
