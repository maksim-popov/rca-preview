import {put, take, all} from "redux-saga/effects";



// action types

const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const GET_LOGIN_STATUS = 'GET_LOGIN_STATUS';
const SET_LOGIN_STATUS = 'SET_LOGIN_STATUS';
const SET_LOGIN_ERRORS = 'SET_LOGIN_ERRORS';
const CLEAR_LOGIN_ERRORS = 'CLEAR_LOGIN_ERRORS';


// actions
export const login = payload =>{
    return{
        type: LOGIN,
        payload: payload
    }
};

export const getLoginStatus = () =>{
    return{
        type: GET_LOGIN_STATUS
    }
};

export const logout = () =>{
    return{
        type: LOGOUT
    }
};


// sagas

function* loginSaga() {
    while (true){
        const { payload } = yield take(LOGIN);
        const response = yield fetch('/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const res = yield response.json();
        if (res.loginStatus) {
            yield put({type: SET_LOGIN_STATUS, payload: {loginStatus: res.loginStatus, availableObjects: res.availableObjects, availableForUploads: res.availableForUploads, username: res.username}});
            if (res.loginStatus === 'admin') {
                payload.history.push('/admin')
            }
        } else {
            yield put({type: SET_LOGIN_ERRORS, payload: {loginStatus: false, loginErrorMessage: res.message}});
        }
    }
}

function* logoutSaga() {
    while (true){
        yield take(LOGOUT);
        yield fetch('/logout');
        yield put({type: SET_LOGIN_STATUS, payload: {loginStatus: false}})
    }
}

function* getLoginStatusSaga() {
    while (true){
        yield take(GET_LOGIN_STATUS);
        const response = yield fetch('/get_login_status');
        const res = yield response.json();
        if (res.loginStatus){
            yield put({type: SET_LOGIN_STATUS, payload: {loginStatus: res.loginStatus, availableObjects: res.availableObjects, availableForUploads: res.availableForUploads, username: res.username}})
        }else{
            yield put({type: SET_LOGIN_STATUS, payload: {loginStatus: false}})
        }
    }
}


// reducer

export function authReducer(state = {loginStatus: false, loginErrorMessage: '', availableObjects: '', availableForUploads: '', username: ''}, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_LOGIN_STATUS:
            return { ...state, loginStatus: payload.loginStatus, loginErrorMessage: '', availableObjects: payload.availableObjects, availableForUploads: payload.availableForUploads, username: payload.username};
        case SET_LOGIN_ERRORS:
            return { ...state, loginStatus: false, loginErrorMessage: payload.loginErrorMessage};
        case CLEAR_LOGIN_ERRORS:
            return { ...state, loginStatus: false, loginErrorMessage: ''};
        default :
            return state
    }
}


// root saga
export function* authSaga() {
    yield all([
        loginSaga(),
        logoutSaga(),
        getLoginStatusSaga(),
    ]);
}
