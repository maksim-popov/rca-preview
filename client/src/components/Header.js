import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {withRouter} from "react-router-dom";
import {getLoginStatus, logout} from "../redux/auth";
import { Button } from 'antd';


export const Header = withRouter(connect(state => state, {getLoginStatus, logout})((props) => {
    const redirect = () => {
        if (props.auth.loginStatus) {
            switch (props.auth.loginStatus) {
                case 'user':
                    props.history.push('/upload');
                    break;
                case 'admin':
                    props.history.push('/admin');
                    break;
                case 'manager':
                    props.history.push('/manager');
                    break
            }
        } else {
            props.history.push('/login')
        }
    };

    useEffect(() => {
        props.getLoginStatus();
    }, []);

    useEffect(() => {
        redirect();
    }, [props.auth.loginStatus]);

    return(
        <div className='header'>
            {props.auth.loginStatus ?
                <Button onClick={()=>{
                    props.history.push('/login')
                    props.logout();
                }}>Выйти</Button>
                : null
            }
        </div>
    )
}));
