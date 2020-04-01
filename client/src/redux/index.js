import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import {all} from "redux-saga/effects";
import {authReducer, authSaga} from "./auth";
import {dataReducer, dataSaga} from "./data";
import {usersReducer, usersSaga} from "./users";

// reducer

const reducer = combineReducers({
    auth: authReducer,
    data: dataReducer,
    users: usersReducer
});


// root saga
function* rootSaga() {
  yield all([
      authSaga(),
      dataSaga(),
      usersSaga()
  ]);
}

const saga = createSagaMiddleware();

const store = createStore(reducer, applyMiddleware(saga));
saga.run(rootSaga);

export default store;
