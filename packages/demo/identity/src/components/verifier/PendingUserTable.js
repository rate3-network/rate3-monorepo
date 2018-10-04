import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { inject, observer } from 'mobx-react';
import ChevronRight from '@material-ui/icons/ChevronRightRounded';

import ProfilePic from '../ProfilePic';
import TablePaginationActions from './TablePaginationActions';
import { toggleGrey, modalShadow, identityHeavyGrey } from '../../constants/colors';
import { truncateAddress } from '../../utils/index';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: '0.05em',
  },
  table: {
    minWidth: 500,
    minHeight: 350,
  },
  rowRoot: {
    minHeight: '4em',
    maxHeight: '4em',
    height: '4em',
    '&:hover': {
      boxShadow: modalShadow,
    },
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  spacer: {
    maxWidth: '0px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: '500',
  },
  input: {
    marginRight: 'auto',
    fontWeight: '500',
  },
  caption: {
    fontWeight: '500',
  },
  profilePicContainer: {
    paddingLeft: '2em',
    width: '1rem',
  },
  textCell: {
    fontSize: '1em',
    // fontWeight: 500,
    letterSpacing: '0.03em',
    paddingLeft: '0.5em',
    color: identityHeavyGrey,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  arrowCell: {
    paddingRight: '0px !important',
    color: identityHeavyGrey,
    width: '4em',
  },
});

@inject('RootStore') @observer
class PendingUserTable extends React.Component {
  state = {
    
    page: 0,
    rowsPerPage: 5,
  };

  componentDidMount() {
    console.log('Rate: PendingUserTable -> componentDidMount -> this.props.RootStore.verifierStore.pendingClaimList', this.props.RootStore.verifierStore.pendingClaimList);
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    const list = this.props.RootStore.verifierStore.pendingClaimList;
    let rows;
    if (list.length > 0) {
      rows = list.map((el) => { return el.user; });
      const uniqueArray = rows.filter((elem, index, self) => {
        return index === self.indexOf(elem);
      });
      rows = uniqueArray;
    } else {
      rows = [];
    }
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
    console.log('rows', rows);
    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                return (
                  <TableRow
                    onClick={() => { this.props.RootStore.verifierStore.setUserSelected(row); this.props.RootStore.verifierStore.getIdentityForSelectedUser(); }}
                    className={classes.rowRoot}
                    key={row}
                  >
                    <TableCell className={classes.profilePicContainer} padding="checkbox" scope="row">
                      <ProfilePic size={6} seed={row} />
                    </TableCell>
                    <TableCell className={classes.textCell} component="td" scope="row">
                      {truncateAddress(row, 18)}
                    </TableCell>
                    <TableCell className={classes.arrowCell} component="td" scope="row">
                      <ChevronRight />
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ backgroundColor: toggleGrey, height: `calc(4em * ${emptyRows})` }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  // colSpan={2}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  labelDisplayedRows={({ from, to, count }) => { return (''); }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  classes={{ spacer: classes.spacer, toolbar: classes.toolbar, caption: classes.caption, input: classes.input }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }
}

PendingUserTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PendingUserTable);
