import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router';
import PageBox from '../components/layout/PageBox';
import PageTitle from '../components/layout/PageTitle';
import PageContainer from '../components/layout/PageContainer';
import Box from '../components/layout/Box';
import { RouteComponentProps } from 'react-router-dom';
import BlueButton from '../components/common/BlueButton';
import { COLORS } from '../constants/colors';
import { Direction, truncateAddress } from '../utils/general';
import lineSvg from '../assets/line.svg';
import { CONVERSION_CONTRACT_ADDR } from '../constants/defaults';
import SwapInfoBox from '../components/common/SwapInfoBox';

const styles = createStyles({
  row: {
    marginTop: '2em',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  backButton: {
    textAlign: 'start',
    fontSize: '1rem',
  },
  summaryBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: COLORS.black,
    padding: '1.5em 0 0 0',
    fontWeight: 300,
    fontSize: '1em',
  },
  cardText: {
    color: COLORS.black,
    padding: '1em 0',
    fontWeight: 500,
    fontSize: '1.2em',
  },
  img: {
    padding: '1em 0',
  },
  gap: {
    padding: '0 1em',
  },
  btnRow: {
    padding: '4em 0',
    display: 'flex',
    width: '40%',
    justifyContent: 'space-around',
  },
});

interface IProps {
  direction: Direction;
  value: string;
  goBack(): void;
  next(): void;
  requestS2E(): void;
  requestE2S(): void;
}

type IPropsFinal = WithStyles<typeof styles> & RouteComponentProps<{ role: string }> & IProps;

class SwapRequestPage extends React.Component<IPropsFinal> {
  // state: IState;
  constructor(props: any) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { classes, value, direction, requestE2S, requestS2E } = this.props;
    return (
      <PageBox>
        <PageTitle withBackButton={true} backName="Direct" backAction={this.props.goBack}>
          Swap Request
        </PageTitle>
        <PageContainer>
          <SwapInfoBox value={value} direction={direction} />
          <div className={classes.row}>
            <Box>
              <div className={classes.summaryBox}>
                <span className={classes.cardTitle}>Issuer Identity</span>
                <span className={classes.cardText}>Rate3</span>
                <img className={classes.img} src={lineSvg} alt="line"/>
                <span className={classes.cardTitle}>Smart Contract Address</span>
                <span className={classes.cardText}>
                  {truncateAddress(CONVERSION_CONTRACT_ADDR, 20)}
                </span>
              </div>
            </Box>
            <div className={classes.gap} />
            <Box>
              <div className={classes.summaryBox}>
                <span className={classes.cardTitle}>Ethereum Transaction Fee</span>
                <span className={classes.cardText}>0.0051 ETH</span>
                <img className={classes.img} src={lineSvg} alt="line"/>
                <span className={classes.cardTitle}>Stellar Transaction Fee</span>
                <span className={classes.cardText}>0.00001 XLM</span>
              </div>
            </Box>
          </div>
          <div className={classes.btnRow}>
            <BlueButton
              outlinedDarkBlue
              noCap
              width="10em"
              fontSize="1.1em"
              height="2.2em"
              handleClick={this.props.goBack}
            >
              Back
            </BlueButton>
            <div className={classes.gap} />
            <BlueButton
              darkBlue
              noCap
              width="10em"
              fontSize="1.1em"
              height="2.2em"
              handleClick={() => {
                direction === Direction.E2S ? requestE2S() : requestS2E();
                this.props.next();
              }}
            >
              Send Request
            </BlueButton>
          </div>
        </PageContainer>
      </PageBox>
    );
  }
}

export default withStyles(styles)(withRouter(SwapRequestPage));
