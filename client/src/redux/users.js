import {put, take, all} from "redux-saga/effects";


// action types

const GET_ALL_USERS = 'GET_ALL_USERS';
const SET_ALL_USERS = 'SET_ALL_USERS';
const CHANGE_AVAILABLE_OBJECTS = 'CHANGE_AVAILABLE_OBJECTS';
const CHANGE_AVAILABLE_FOR_UPLOADS = 'CHANGE_AVAILABLE_FOR_UPLOADS';
const RESET_PASSWORD = 'RESET_PASSWORD';
const NEW_USER = 'NEW_USER';
const DELETE_USER = 'DELETE_USER';


// actions
export const getAllUsers = () =>{
    return{
        type: GET_ALL_USERS,
    }
};

export const changeAvailableProjects = (payload) =>{
    return{
        type: CHANGE_AVAILABLE_OBJECTS,
        payload: payload
    }
};

export const changeAvailableForUploads = (payload) =>{
    return{
        type: CHANGE_AVAILABLE_FOR_UPLOADS,
        payload: payload
    }
};

export const resetPassword = (payload) =>{
    return{
        type: RESET_PASSWORD,
        payload: payload
    }
};

export const newUser = (payload) =>{
    return{
        type: NEW_USER,
        payload: payload
    }
};

export const deleteUser = (payload) =>{
    return{
        type: DELETE_USER,
        payload: payload
    }
};


// sagas

function* getAllUsersSaga() {
    while (true){
        yield take(GET_ALL_USERS);
        const response = yield fetch('/get_all_users');
        const res = yield response.json();
        yield put({type: SET_ALL_USERS, payload: res})
    }
}

function* changeAvailableProjectsSaga() {
    while (true){
        const { payload } = yield take(CHANGE_AVAILABLE_OBJECTS);
        yield fetch('/change_available_projects', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_ALL_USERS});
        yield put({type: 'GET_LOGIN_STATUS'})
    }
}

function* changeAvailableForUploadsSaga() {
    while (true){
        const { payload } = yield take(CHANGE_AVAILABLE_FOR_UPLOADS);
        yield fetch('/change_available_for_uploads', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_ALL_USERS});
        yield put({type: 'GET_LOGIN_STATUS'})
    }
}

function* resetPasswordSaga() {
    while (true){
        const { payload } = yield take(RESET_PASSWORD);
        yield fetch('/reset_password', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    }
}

function* newUserSaga() {
    while (true){
        const { payload } = yield take(NEW_USER);
        yield fetch('/new_user', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_ALL_USERS})
    }
}

function* deleteUserSaga() {
    while (true){
        const { payload } = yield take(DELETE_USER);
        yield fetch('/delete_user', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_ALL_USERS})
    }
}


// reducer

export function usersReducer(state = {usersList: ''}, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_ALL_USERS:
            return { ...state, usersList: payload};
        default :
            return state
    }
}

// root saga
export function* usersSaga() {
    yield all([
        getAllUsersSaga(),
        changeAvailableProjectsSaga(),
        resetPasswordSaga(),
        newUserSaga(),
        deleteUserSaga(),
        changeAvailableForUploadsSaga()
    ]);
}
