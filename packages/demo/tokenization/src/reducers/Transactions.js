import { transactionsActions } from '../actions/Transactions';


const initialState = {
  // transactions for the current account
  current: [],
  currentPage: 0,
  currentRowsPerPage: 5,
  currentFilterType: null,
  currentFilterStatus: null,

  // pending transactions for the current issuer account
  pendingApproval: [],
  pendingApprovalPage: 0,
  pendingApprovalRowsPerPage: 5,
};

/**
 * Reducer for transactions
 *
 * @param {Object} [state=initialState] Previous state
 * @param {Object} [action={}] Current action
 * @returns {Object} Next state
 */
export default function (state = initialState, action = {}) {
  const { type } = action;
  switch (type) {
    case transactionsActions.SET_CURRENT_TRANSACTIONS: {
      const { transactions, filterType, filterStatus } = action;
      return {
        ...state,
        current: transactions,
        currentPage: 0,
        currentFilterType: filterType,
        currentFilterStatus: filterStatus,
      };
    }
    case transactionsActions.SET_CURRENT_PAGE: {
      const { pageNum } = action;
      return {
        ...state,
        currentPage: pageNum,
      };
    }
    case transactionsActions.SET_CURRENT_ROWS_PER_PAGE: {
      const { rows } = action;
      return {
        ...state,
        currentRowsPerPage: rows,
      };
    }
    case transactionsActions.SET_PENDING_APPROVAL_TRANSACTIONS: {
      const { transactions } = action;
      return {
        ...state,
        pendingApproval: transactions,
        pendingApprovalPage: 0,
      };
    }
    case transactionsActions.SET_PENDING_APPROVAL_PAGE: {
      const { pageNum } = action;
      return {
        ...state,
        pendingApprovalPage: pageNum,
      };
    }
    case transactionsActions.SET_PENDING_APPROVAL_ROWS_PER_PAGE: {
      const { rows } = action;
      return {
        ...state,
        pendingApprovalRowsPerPage: rows,
      };
    }
    default: {
      return state;
    }
  }
}
