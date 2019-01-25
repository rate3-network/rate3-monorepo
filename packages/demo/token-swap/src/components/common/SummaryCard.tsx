import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { SUMMARY_CARD, SIDEBAR } from '../../constants/colors';
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
    gridColumnGap: '0.3em',
    gridTemplateColumns: '1fr 4fr',
    color: 'white',
    borderRadius: '0.35rem',
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
  ethSGDRText: {
    fontSize: '1em',
    fontWeight: 300,
    color: SUMMARY_CARD.eth.textColor,
  },
  stellarSGDRText: {
    fontSize: '1em',
    fontWeight: 300,
    color: SUMMARY_CARD.stellar.textColor,
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
  ethBlockchain: {
    gridArea: 'blockchain',
    fontSize: '0.9em',
    fontWeight: 300,
    color: SUMMARY_CARD.eth.textColor,
  },
  stellarBlockchain: {
    gridArea: 'blockchain',
    fontSize: '0.9em',
    fontWeight: 300,
    color: SUMMARY_CARD.stellar.textColor,
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
          {value ? value : '0.00'}
          <span
            className={classnames(
              { [classes.ethSGDRText]: type === 'eth' },
              { [classes.stellarSGDRText]: type === 'stellar' }
            )}
          > SGDR
          </span>
        </div>
        <div
          className={classnames(
            { [classes.ethBlockchain]: type === 'eth' },
            { [classes.stellarBlockchain]: type === 'stellar' }
          )}
        >
          {type === 'eth' ? 'Ethereum Blockchain' : 'Stellar Blockchain'}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SwapDetailsPage);
