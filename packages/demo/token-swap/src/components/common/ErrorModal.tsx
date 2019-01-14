import * as React from 'react';
import Modal from '@material-ui/core/Modal';
import { connect } from 'react-redux';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { IStoreState } from '../../reducers/network';
import { COLORS } from '../../constants/colors';
// import BlueButton from './BlueButton';
import Button from '@material-ui/core/Button';
const styles = createStyles({
  modal: {
    position: 'absolute',
    top: 'calc(50% - 7em)',
    left: 'calc(50% - 13em)',
    width: '26rem',
    height: '14rem',
    '&:focus': {
      outline: 'none',
    },
    color: COLORS.errorRed,
  },
  content: {
    width: '100%',
    height: '100%',
    // overflow: 'scroll',
    backgroundColor: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '0.5em',
    padding: '1em',
  },
  title:{
    fontSize: '1.6em',
    fontWeight: 700,
  },
  message: {
    marginTop: '2em',
  },
  errorBox: {
    color: COLORS.grey,
    margin: '1em 0',
    width: '90%',
    maxHeight: '60px',
    overflowY: 'scroll',
  },
});
interface IProps {
  error: null | string;
}
class RoleSwitch extends React.Component<IProps & WithStyles<typeof styles>> {
  render() {
    const { classes } = this.props;
    const { theme } = this.context;
    return (
      <Modal className={classes.modal} open={Boolean(this.props.error)}>
        <div className={classes.content}>
          <div className={classes.title}>
            ERROR
          </div>
          <div className={classes.message}>
            An Unexpected Error Has Occurred. Please Try to Refresh the Page.
          </div>
          <div className={classes.errorBox}>
            Error Message: {JSON.stringify(this.props.error)}
          </div>
          <Button onClick={() => { location.reload(); }}>Refresh</Button>
        </div>
      </Modal>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    error: network.error,
  };
}
export default connect(mapStateToProps, null)(withStyles(styles)(RoleSwitch));
