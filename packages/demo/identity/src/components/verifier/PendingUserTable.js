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

import TablePaginationActions from './TablePaginationActions';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: '0.05em',
  },
  table: {
    minWidth: 500,
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
});

class PendingUserTable extends React.Component {
  state = {
    rows: this.props.pendingList,
    page: 0,
    rowsPerPage: 5,
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                return (
                  <TableRow key={row.address}>
                    <TableCell component="th" scope="row">
                      {row.blockie}{row.address}
                    </TableCell>
                  </TableRow>
                );
              })}
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
