import React from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import LoginPage from "./components/LoginPage";
import {UploadPage} from "./components/UploadPage";
import {AdminPage} from "./components/AdminPage/";
import store from "./redux";
import {Provider} from "react-redux";
import {Header} from "./components/Header";
import {ManagerPage} from "./components/ManagerPage";

export default function App () {
    return (
        <Provider store={store}>
            <Router>
                <div className="App">
                    <Header />
                    <Switch>
                        <Route path='/login' exact component={LoginPage}/>
                        <Route path='/upload' exact component={UploadPage}/>
                        <Route path='/admin' exact component={AdminPage}/>
                        <Route path='/manager' exact component={ManagerPage}/>
                    </Switch>
                </div>
            </Router>
        </Provider>
    );

};
