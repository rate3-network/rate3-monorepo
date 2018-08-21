import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import TablePaginationActions from './TablePaginationActions';

import {
  tableHeader,
} from '../../constants/colors';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    letterSpacing: 0,
  },
  table: {
    minWidth: 500,
  },
  tableCell: {
    padding: theme.spacing.unit,
    border: 'none',
  },
  tableCellDateTime: {
    fontSize: '0.9em',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: tableHeader,
    padding: theme.spacing.unit,
    textAlign: 'left',
    border: 'none',
    fontSize: '1.1em',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

const TransactionsTable = ({
  classes,
  columns,
  rows,
  currentPage,
  labelDisplayedRows,
  rowsPerPage,
  labelRowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const emptyRows = rowsPerPage - Math.min(
    rowsPerPage,
    rows.length - currentPage * rowsPerPage,
  );

  return (
    <div className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {
                columns
                  .filter(col => !col.hide)
                  .map(col => (
                    <TableCell classes={{ root: classes.tableHeaderCell }}>
                      {col.head}
                    </TableCell>
                  ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              rows
                .slice(
                  currentPage * rowsPerPage,
                  currentPage * rowsPerPage + rowsPerPage,
                )
                .map(txn => (
                  <TableRow key={txn.txHash} style={{ height: 64 }}>
                    {
                      columns
                        .filter(col => !col.hide)
                        .map((col, idx) => (
                          idx === 0
                            ? (
                              <TableCell
                                component="th"
                                scope="row"
                                classes={{ root: classes.tableCell }}
                              >
                                {col.renderCell(txn)}
                              </TableCell>
                            )
                            : (
                              <TableCell classes={{ root: classes.tableCell }}>
                                {col.renderCell(txn)}
                              </TableCell>
                            )
                        ))
                    }
                  </TableRow>
                ))
            }
            {emptyRows > 0 && (
              <TableRow style={{ height: 64 * emptyRows }}>
                <TableCell colSpan={emptyRows} classes={{ root: classes.tableCell }} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={6}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                labelRowsPerPage={labelRowsPerPage}
                page={currentPage}
                labelDisplayedRows={labelDisplayedRows}
                onChangePage={onChangePage}
                onChangeRowsPerPage={onChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

TransactionsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    head: PropTypes.node.isRequired,
    renderCell: PropTypes.func.isRequired,
    hide: PropTypes.bool,
  })).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentPage: PropTypes.number.isRequired,
  labelDisplayedRows: PropTypes.func.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  labelRowsPerPage: PropTypes.node.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeRowsPerPage: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(TransactionsTable);
