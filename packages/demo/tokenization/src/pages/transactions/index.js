import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import FilterDropdown from '../../components/transactions/FilterDropdown';
import Table from '../../components/transactions/Table';
import { SgdPill, SgdrPill } from '../../components/CurrencyPill';

import { txType, txStatus } from '../../constants/enums';
import {
  transactionPending,
  transactionSuccess,
  transactionError,
} from '../../constants/colors';
import {
  setCurrentPage as setCurrentPageAction,
  setCurrentRowsPerPage as setCurrentRowsPerPageAction,
  setCurrentFilter as setCurrentFilterAction,
} from '../../actions/Transactions';
import { compose } from '../../utils';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 5,
  },
  statusCell: {
    display: 'flex',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: '1em',
    flexShrink: 0,
  },
  statusDotPending: {
    backgroundColor: transactionPending,
  },
  statusDotSuccess: {
    backgroundColor: transactionSuccess,
  },
  statusDotError: {
    backgroundColor: transactionError,
  },
});


class Transactions extends React.Component {
  handleChangePage = (e, page) => {
    const { setCurrentPage } = this.props;
    setCurrentPage(page);
  };

  handleChangeRowsPerPage = (e) => {
    const { setCurrentRowsPerPage } = this.props;
    setCurrentRowsPerPage(e.target.value);
  }

  handleFilterTypeChange = (newFilterTypes) => {
    const { setCurrentFilter, filterStatus } = this.props;
    const filterType = Object.keys(newFilterTypes)
      .reduce((hasFilter, option) => hasFilter || newFilterTypes[option], false)
      ? newFilterTypes
      : null;
    setCurrentFilter(filterType, filterStatus);
  }

  handleFilterStatusChange = (newFilterStatus) => {
    const { setCurrentFilter, filterType } = this.props;
    const filterStatus = Object.keys(newFilterStatus)
      .reduce((hasFilter, option) => hasFilter || newFilterStatus[option], false)
      ? newFilterStatus
      : null;
    setCurrentFilter(filterType, filterStatus);
  }

  renderTxHash = txn => (
    `${txn.tx_hash.substring(0, 9)}...`
  )

  renderFromAddr = txn => (
    `${txn.from.substring(0, 9)}...`
  )

  renderDate = (txn) => {
    const { classes } = this.props;
    const d = new Date(txn.date);

    return (
      <div className={classes.tableCellDateTime}>
        <div>{d.toLocaleDateString()}</div>
        <div>{d.toLocaleTimeString()}</div>
      </div>
    );
  }

  renderAmount = txn => (
    <div style={{ fontSize: '1.2em' }}>
      <span style={{ fontWeight: 'bold' }}>{txn.amount}</span>
      &nbsp;
      {txn.type === txType.TOKENIZE
        ? <SgdPill />
        : <SgdrPill />
      }
    </div>
  )

  renderType = (txn) => {
    const { t } = this.props;
    switch (txn.type) {
      case txType.TOKENIZE: {
        return t('typeTokenize');
      }
      case txType.WITHDRAWAL: {
        return t('typeWithdraw');
      }
      default: {
        return null;
      }
    }
  }

  renderStatus = (txn) => {
    const { classes, t } = this.props;
    const genNode = (dotClass, text) => (
      <div className={classes.statusCell}>
        <div className={[dotClass, classes.statusDot].join(' ')} />
        <div className={classes.statusText}>{text}</div>
      </div>
    );
    switch (txn.status) {
      case txStatus.PENDING_NETWORK: {
        return genNode(classes.statusDotPending, t('statusPendingNetwork'));
      }
      case txStatus.PENDING_APPROVAL: {
        return genNode(classes.statusDotPending, t('statusPendingApproval'));
      }
      case txStatus.SUCCESS: {
        return genNode(classes.statusDotSuccess, t('statusSuccess'));
      }
      case txStatus.ERROR: {
        return genNode(classes.statusDotError, t('statusError'));
      }
      default: {
        return null;
      }
    }
  }

  render() {
    const {
      classes,
      t,
      isUser,
      currentPage,
      rowsPerPage,
      transactions,
      filterType,
      filterStatus,
    } = this.props;

    const getChecked = (filter, key) => Boolean(filter && filter[key]);
    const filters = [
      {
        group: 'Type',
        options: [
          {
            label: 'Tokenize',
            value: txType.TOKENIZE,
            checked: getChecked(filterType, txType.TOKENIZE),
          },
          {
            label: 'Withdrawal',
            value: txType.WITHDRAWAL,
            checked: getChecked(filterType, txType.WITHDRAWAL),
          },
        ],
        onChange: this.handleFilterTypeChange,
      },
      {
        group: 'Status',
        options: [
          {
            label: 'Pending Network',
            value: txStatus.PENDING_NETWORK,
            checked: getChecked(filterStatus, txStatus.PENDING_NETWORK),
          },
          {
            label: 'Pending Approval',
            value: txStatus.PENDING_APPROVAL,
            checked: getChecked(filterStatus, txStatus.PENDING_APPROVAL),
          },
          {
            label: 'Success',
            value: txStatus.SUCCESS,
            checked: getChecked(filterStatus, txStatus.SUCCESS),
          },
          {
            label: 'Error',
            value: txStatus.ERROR,
            checked: getChecked(filterStatus, txStatus.ERROR),
          },
        ],
        onChange: this.handleFilterStatusChange,
      },
    ];

    const columns = [
      {
        head: t('txHash'),
        renderCell: this.renderTxHash,
      },
      {
        head: t('from'),
        renderCell: this.renderFromAddr,
        hide: isUser,
      },
      {
        head: t('date/time'),
        renderCell: this.renderDate,
      },
      {
        head: t('amount'),
        renderCell: this.renderAmount,
      },
      {
        head: t('type'),
        renderCell: this.renderType,
      },
      {
        head: t('status'),
        renderCell: this.renderStatus,
      },
    ];

    return (
      <div className={classes.root}>
        <FilterDropdown
          filters={filters}
        />
        <Table
          columns={columns}
          rows={transactions.slice().reverse()}
          currentPage={currentPage}
          labelDisplayedRows={({ from, to, count }) => (
            <Trans i18nKey="tableDisplayedRows">
              {{ from }}
              -
              {{ to }}
              &nbsp;of&nbsp;
              {{ count }}
            </Trans>
          )}
          rowsPerPage={rowsPerPage}
          labelRowsPerPage={t('rowsPerPage')}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </div>
    );
  }
}

Transactions.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC

  // State
  isUser: PropTypes.bool.isRequired,
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentPage: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  filterType: PropTypes.object,
  filterStatus: PropTypes.object,

  // Actions
  setCurrentPage: PropTypes.func.isRequired,
  setCurrentRowsPerPage: PropTypes.func.isRequired,
  setCurrentFilter: PropTypes.func.isRequired,
};

Transactions.defaultProps = {
  filterType: {},
  filterStatus: {},
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
  transactions: state.transactions.current,
  currentPage: state.transactions.currentPage,
  rowsPerPage: state.transactions.currentRowsPerPage,
  filterType: state.transactions.currentFilterType,
  filterStatus: state.transactions.currentFilterStatus,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate('transactions'),
  connect(
    mapStateToProps,
    {
      setCurrentPage: setCurrentPageAction,
      setCurrentRowsPerPage: setCurrentRowsPerPageAction,
      setCurrentFilter: setCurrentFilterAction,
    },
  ),
);

export default enhance(Transactions);
