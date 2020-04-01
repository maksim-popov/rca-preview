import {put, take, all} from "redux-saga/effects";
var FileSaver = require('file-saver');

// action types

const GET_CURRENT_OBJECT_INFO = 'GET_CURRENT_OBJECT_INFO';
const SET_CURRENT_OBJECT_INFO = 'SET_CURRENT_OBJECT_INFO';
const CLEAR_CURRENT_OBJECT_INFO = 'CLEAR_CURRENT_OBJECT_INFO';
const GET_CURRENT_MONTH_INFO = 'GET_CURRENT_MONTH_INFO';
const SET_CURRENT_MONTH_INFO = 'GET_CURRENT_MONTH_INFO';
const CHANGE_SHARE = 'CHANGE_SHARE';
const GET_PROJECT_STRUCTURE = 'GET_PROJECT_STRUCTURE';
const SET_PROJECT_STRUCTURE = 'SET_PROJECT_STRUCTURE';
const ADD_NEW_OBJECT = 'ADD_NEW_OBJECT';
const DELETE_OBJECT = 'DELETE_OBJECT';
const DELETE_REPORT = 'DELETE_REPORT';
const CREATE_EXCEL = 'CREATE_EXCEL';
const GET_HISTORY = 'GET_HISTORY';
const SET_HISTORY = 'SET_HISTORY';
const GET_CHART_INFO = 'GET_CHART_INFO';
const SET_CHART_INFO = 'SET_CHART_INFO';

// actions

export const getCurrentObjectInfo = (payload) =>{
    return{
        type: GET_CURRENT_OBJECT_INFO,
        payload: payload
    }
};

export const clearCurrentObjectInfo = () =>{
    return{
        type: CLEAR_CURRENT_OBJECT_INFO,
    }
};


export const getCurrentMonthInfo = (payload) =>{
    return{
        type: GET_CURRENT_MONTH_INFO,
        payload: payload
    }
};

export const changeShare = (payload) =>{
    return{
        type: CHANGE_SHARE,
        payload: payload
    }
};

export const getProjectStructure = () =>{
    return{
        type: GET_PROJECT_STRUCTURE,
    }
};

export const addNewObject = (payload) =>{
    return{
        type: ADD_NEW_OBJECT,
        payload: payload
    }
};

export const deleteObject = (payload) =>{
    return{
        type: DELETE_OBJECT,
        payload: payload
    }
};

export const deleteReport = (payload) =>{
    return{
        type: DELETE_REPORT,
        payload: payload
    }
};

export const createExcel = (payload) =>{
    return{
        type: CREATE_EXCEL,
        payload: payload
    }
};

export const getHistory = (payload) =>{
    return{
        type: GET_HISTORY,
        payload: payload
    }
};

export const getChartInfo = (payload) =>{
    return{
        type: GET_CHART_INFO,
        payload: payload
    }
};


// sagas

function* getCurrentObjectInfoSaga() {
    while (true){
        const {payload} = yield take(GET_CURRENT_OBJECT_INFO);
        const response = yield fetch('/get_current_object_info', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const res = yield response.json();
        yield put({type: SET_CURRENT_OBJECT_INFO, payload: res});
    }
}

function* getCurrentMonthInfoSaga() {
    while (true){
        const {payload} = yield take(GET_CURRENT_MONTH_INFO);
        const response = yield fetch('/get_current_month_info', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const res = yield response.json();
        yield put({type: SET_CURRENT_MONTH_INFO, payload: res});
    }
}

function* changeShareSaga() {
    while (true){
        const {payload} = yield take(CHANGE_SHARE);
        yield fetch('/change_share', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_CURRENT_MONTH_INFO, payload: {month: payload.month, availableObjects: payload.availableObjects}});
    }
}

function* getProjectStructureSaga() {
    while (true){
        yield take(GET_PROJECT_STRUCTURE);
        const response = yield fetch('/get_project_structure');
        const res = yield response.json();
        yield put({type: SET_PROJECT_STRUCTURE, payload: res});
    }
}

function* addNewObjectSaga() {
    while (true){
        const {payload} = yield take(ADD_NEW_OBJECT);
        yield fetch('/add_new_object', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_PROJECT_STRUCTURE});
    }
}

function* deleteObjectSaga() {
    while (true){
        const {payload} = yield take(DELETE_OBJECT);
        yield fetch('/delete_object', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_PROJECT_STRUCTURE});
    }
}

function* deleteReportSaga() {
    while (true){
        const {payload} = yield take(DELETE_REPORT);
        yield fetch('/delete_report', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        yield put({type: GET_CURRENT_OBJECT_INFO, payload: payload});
    }
}

function* createExcelSaga() {
    while (true){
        const {payload} = yield take(CREATE_EXCEL);
        const response = yield fetch('/create_excel', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const blob = yield response.blob();
        FileSaver.saveAs(blob, "report.xlsx");
        console.log("response.blob(): ", blob);
    }
}

function* getHistorySaga() {
    while (true){
        const {payload} = yield take(GET_HISTORY);
        const response = yield fetch('/get_history', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const res = yield response.json();
        yield put({type: SET_HISTORY, payload: res});
    }
}

function* getChartInfoSaga() {
    while (true){
        const {payload} = yield take(GET_CHART_INFO);
        const response = yield fetch('/get_chart_info', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const res = yield response.json();
        yield put({type: SET_CHART_INFO, payload: res});
    }
}


// reducer

const startState = {
    currentObjectInfo: '',
    currentMonthInfo: '',
    projectStructure: '',
    history: '',
    chartInfo: {},
};

export function dataReducer(state = startState, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_CURRENT_OBJECT_INFO:
            return { ...state, currentObjectInfo: payload};
        case CLEAR_CURRENT_OBJECT_INFO:
            return { ...state, currentObjectInfo: ''};
        case SET_CURRENT_MONTH_INFO:
            return { ...state, currentMonthInfo: payload};
        case SET_PROJECT_STRUCTURE:
            return { ...state, projectStructure: payload};
        case SET_HISTORY:
            return { ...state, history: payload};
        case SET_CHART_INFO:
            return { ...state, chartInfo: payload};
        default :
            return state
    }
}


// root saga
export function* dataSaga() {
    yield all([
        getCurrentObjectInfoSaga(),
        getCurrentMonthInfoSaga(),
        changeShareSaga(),
        getProjectStructureSaga(),
        addNewObjectSaga(),
        deleteObjectSaga(),
        deleteReportSaga(),
        createExcelSaga(),
        getHistorySaga(),
        getChartInfoSaga(),
    ]);
}
