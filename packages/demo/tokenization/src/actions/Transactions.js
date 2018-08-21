import { keyMirror } from '../utils';

export const transactionsActions = keyMirror(
  {
    SET_CURRENT_TRANSACTIONS: null,
    SET_CURRENT_PAGE: null,
    SET_CURRENT_ROWS_PER_PAGE: null,
    SET_CURRENT_FILTER: null,

    SET_PENDING_APPROVAL_TRANSACTIONS: null,
    SET_PENDING_APPROVAL_PAGE: null,
    SET_PENDING_APPROVAL_ROWS_PER_PAGE: null,
  },
  'TRANSACTIONS',
);

export const setCurrentFilter = (types, status) => ({
  type: transactionsActions.SET_CURRENT_FILTER,
  filterType: types,
  filterStatus: status,
});

export const setCurrentPage = pageNum => ({
  type: transactionsActions.SET_CURRENT_PAGE,
  pageNum,
});

export const setCurrentRowsPerPage = rows => ({
  type: transactionsActions.SET_CURRENT_ROWS_PER_PAGE,
  rows,
});

export const setPendingApprovalPage = pageNum => ({
  type: transactionsActions.SET_PENDING_APPROVAL_PAGE,
  pageNum,
});

export const setPendingApprovalRowsPerPage = rows => ({
  type: transactionsActions.SET_PENDING_APPROVAL_ROWS_PER_PAGE,
  rows,
});
