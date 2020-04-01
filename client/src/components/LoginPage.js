import React, {useEffect} from 'react';
import {Form, Icon, Input, Button, Checkbox, Alert} from 'antd';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import {login} from "../redux/auth";

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const mapStateToProps = state =>{
    return{
        ...state
    }
};

const LoginPageForm =  withRouter(connect(mapStateToProps, {login})((props) => {

    useEffect(() => {
        props.form.validateFields();
    }, []);

       const handleSubmit = e => {
            e.preventDefault();
            props.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                    props.login({...values, history: props.history})
                }
            });
        };

    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = props.form;
    const usernameError = isFieldTouched('username') && getFieldError('username');
    const passwordError = isFieldTouched('password') && getFieldError('password');

        return (
            <div>
                <h1>Report Consolidation App</h1>
                <div className="login-container">
                    <Form className="login-form" onSubmit={handleSubmit}>
                        <Form.Item validateStatus={usernameError ? 'error' : ''} help={usernameError || ''}>
                            {getFieldDecorator('username', {
                                rules: [{ required: true, message: 'Пожалуйста, введите Ваш логин!' }],
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Логин"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item validateStatus={passwordError ? 'error' : ''} help={passwordError || ''}>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: 'Пожалуйста, введите пароль!' }],
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    type="password"
                                    placeholder="Пароль"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(<Checkbox>Запомнить меня</Checkbox>)}
                        </Form.Item>
                        {props.auth.loginErrorMessage ?
                            <Alert message={props.auth.loginErrorMessage} className="login-msg" type="error"/>
                            : null
                        }
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button" disabled={hasErrors(getFieldsError())}>
                                Войти
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        );

}));

const LoginPage = Form.create({ name: 'horizontal_login' })(LoginPageForm);

export default LoginPage;
