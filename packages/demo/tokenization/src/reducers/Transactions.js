import { transactionsActions } from '../actions/Transactions';


const initialState = {
  // transactions for the current account
  current: [],
  currentPage: 0,
  currentRowsPerPage: 5,
  currentFilterType: null,
  currentFilterStatus: null,

  // pending approval transactions for the current trustee account
  pendingApproval: [],
  pendingApprovalPage: 0,
  pendingApprovalRowsPerPage: 5,

  // pending transactions for the current trustee account
  pendingFinalize: [],
  pendingFinalizePage: 0,
  pendingFinalizeRowsPerPage: 5,
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
      const {
        transactions,
        resetPage,
        filterType,
        filterStatus,
      } = action;

      return {
        ...state,
        current: transactions,
        currentPage: resetPage ? 0 : state.currentPage,
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
      const { transactions, resetPage } = action;
      return {
        ...state,
        pendingApproval: transactions,
        pendingApprovalPage: resetPage ? 0 : state.pendingApprovalPage,
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
    case transactionsActions.SET_PENDING_FINALIZE_TRANSACTIONS: {
      const { transactions, resetPage } = action;
      return {
        ...state,
        pendingFinalize: transactions,
        pendingFinalizePage: resetPage ? 0 : state.pendingFinalizePage,
      };
    }
    case transactionsActions.SET_PENDING_FINALIZE_PAGE: {
      const { pageNum } = action;
      return {
        ...state,
        pendingFinalizePage: pageNum,
      };
    }
    case transactionsActions.SET_PENDING_FINALIZE_ROWS_PER_PAGE: {
      const { rows } = action;
      return {
        ...state,
        pendingFinalizeRowsPerPage: rows,
      };
    }
    case transactionsActions.RESET_PAGES_AND_FILTER: {
      return {
        ...state,
        currentPage: 0,
        currentFilterType: null,
        currentFilterStatus: null,
        pendingApprovalPage: 0,
        pendingFinalizePage: 0,
      };
    }
    default: {
      return state;
    }
  }
}
