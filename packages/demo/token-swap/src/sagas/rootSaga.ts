import { all, call, put, takeEvery } from 'redux-saga/effects';
import { counterActions } from '../actions/counter';
import network from './network';

function* fetchApi(action: any) {
  try {
    const response = yield call(
      fetch, `https://jsonplaceholder.typicode.com/todos/${action.payload.id}`);
    const data = yield call([response, response.json]);
    yield put({ type: counterActions.RECEIVE_CONTENT, payload: { responseBody: data } });
    console.log(data);
    return data;
  } catch (e) {
    yield put({ type: counterActions.CONTENT_FAILED, error:
    { content: `failed to retrieve ${action.payload.id}` } });
    console.log(e);
    return null; // good to return something here
  }
}

function* watchRequest() {
  yield takeEvery(counterActions.REQUEST_CONTENT, fetchApi);
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    // fetchApi(),
    network(),
    watchRequest(),
  ]);
}
