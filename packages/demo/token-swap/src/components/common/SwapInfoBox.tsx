import * as React from 'react';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Box from '../../components/layout/Box';
import { COLORS } from '../../constants/colors';
import SummaryCard from '../../components/common/SummaryCard';
import { Direction } from '../../utils/general';
import arrowSvg from '../../assets/arrow.svg';
const styles = createStyles({
  titleRow: {
    padding: '0.4em 0',
    fontSize: '1em',
    gridGap: '0',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '100%',
    borderBottom: `1px solid ${COLORS.lighGrey}`,
  },
  greyTitle: {
    color: COLORS.lighGrey,
    textAlign: 'center',
  },
  cardRow: {
    padding: '2em 0',
    display: 'flex',
    width: '70%',
    justifyContent: 'space-around',
  },
});

interface IProps {
  direction: Direction;
  value: string;
}

type IPropsFinal = WithStyles<typeof styles> & IProps;

class SwapInfoBox extends React.Component<IPropsFinal> {
  constructor(props: any) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { classes, value, direction } = this.props;
    return (
      <Box>
        <div className={classes.titleRow}>
          <span className={classes.greyTitle}>Your Deposit</span>
          <span className={classes.greyTitle}>You Withdraw</span>
        </div>
        <div className={classes.cardRow}>
          {direction === Direction.E2S ?
            <>
              <SummaryCard type="eth" value={value} />
              <img src={arrowSvg} alt="arrow"/>
              <SummaryCard type="stellar" value={value} />
            </>
            :
            <>
              <SummaryCard type="stellar" value={value} />
              <img src={arrowSvg} alt="arrow"/>
              <SummaryCard type="eth" value={value} />
            </>
          }
        </div>
      </Box>
    );
  }
}

export default withStyles(styles)(SwapInfoBox);
