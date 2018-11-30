import { delay } from 'redux-saga';
import { all, call, put, takeEvery } from 'redux-saga/effects';

function* fetchApi(action: any) {
  console.log(action.id);

  // yield responseBody;
  // yield put({ type: 'SET_CONTENT', content: JSON.stringify(response) });
  // console.log(response);
  try {
    const response = yield call(fetch, `https://jsonplaceholder.typicode.com/todos/${action.id}`);
    // const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = yield call([response, response.json]);
    // const responseBody = response.json();
    // yield responseBody;
    yield put({ type: 'RECEIVE_CONTENT', responseBody: data });
    console.log(data);
    return data;
  } catch (e) {
    yield put({ type: 'CONTENT_FAILED', error: { content: `failed to retrieve ${action.id}` } });
    console.log(e);
    return null; // good to return something here
  }
}

function* incrementAsync() {
  yield delay(1000);
  yield put({ type: 'INCREMENT' });
}

function* watchIncrementAsync() {
  yield takeEvery('INCREMENT_ASYNC', incrementAsync);
  yield takeEvery('REQUEST_CONTENT', fetchApi);
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    // fetchApi(),
    watchIncrementAsync(),
  ]);
}
