import React, {useEffect, useState} from 'react'
import {connect} from "react-redux";
import {
    changeAvailableForUploads,
    changeAvailableProjects,
    deleteUser,
    getAllUsers,
    newUser,
    resetPassword
} from "../../redux/users";
import {Row, Col, TreeSelect, Button, Card, Typography, Input, Select, Icon, message} from "antd";
import {getProjectStructure} from "../../redux/data";
const { TreeNode } = TreeSelect;
const { Title } = Typography;
const { Option } = Select;


export const UsersPage = connect(state => state, {getAllUsers, getProjectStructure, changeAvailableProjects, changeAvailableForUploads, resetPassword, newUser, deleteUser})((props) => {

    const [newLogin, setNewLogin] = useState('');
    const [newType, setNewType] = useState('user');
    const [newAvailableProjects, setNewAvailableProjects] = useState([]);

    const newUserAction = () => {
        props.newUser({
            role: newType,
            username: newLogin,
            password: "",
            availableObjects: newAvailableProjects.map((item) => {
                return {
                    project: item.split(':')[0],
                    object: item.split(':')[1] ? item.split(':')[1] : ''
                }
            }),
            availableForUploads: newAvailableProjects.map((item) => {
                return {
                    project: item.split(':')[0],
                    object: item.split(':')[1] ? item.split(':')[1] : ''
                }
            })
        });
        setNewLogin('');
        setNewType('user');
        setNewAvailableProjects([]);
    };

    const getAllProjectsList = () => {
        let treeList = [];
        if (props.data.projectStructure) {
            props.data.projectStructure.list.forEach((item) => {
                treeList.push(<TreeNode value={item.project + ":" + item.object} title={item.project + " " + item.object} key={item.project + item.object}/>)
            })
        }
        return treeList
    };

    const userCardsList = () => {
        let users = props.users.usersList;
        let usersCardList = [];
        users.forEach((user) => {
            let list = user.availableObjects.map((item) => {
                return (item.project + ":" + item.object)
            });
            let listForUploads = user.availableForUploads.map((item) => {
                return (item.project + ":" + item.object)
            });
            usersCardList.push(
                <Card key={user.username}  style={{marginBottom: 30, backgroundColor: '#fafafa', borderRadius: '5px', textAlign: "left"}}>
                    <Row>
                        <Col lg={10} style={{padding: 10}}>
                            <p>Логин:</p>
                            <Title level={4}>{user.username}</Title>
                        </Col>
                        <Col lg={4} style={{padding: 10}}>
                            <p>Тип:</p>
                            <Title level={4}>{user.role}</Title>
                        </Col>
                        <Col lg={5} style={{padding: 10, textAlign: 'center', marginTop: 20}}>
                            <Button type="primary" onClick={() => {
                                props.resetPassword({username: user.username})
                                message.info('Пароль сброшен!');
                            }} ghost style={{margin: "10px auto"}}> Сбросить пароль </Button>
                        </Col>
                        <Col lg={5} style={{padding: 10, textAlign: 'center',  marginTop: 20}}>
                            <Button type="danger" ghost style={{margin: "10px auto"}} onClick={() => {props.deleteUser({username: user.username})}}> Удалить пользователя </Button>
                        </Col>
                        <Col lg={12} style={{padding: 10}}>
                            <p>Доступные объекты для просмотра:</p>
                            <TreeSelect
                                showSearch
                                multiple
                                style={{ width: '100%' }}
                                defaultValue={list}
                                onChange={(value) => {
                                    props.changeAvailableProjects({username: user.username, availableProjects: value})
                                }}
                            >
                                {getAllProjectsList()}
                            </TreeSelect>
                        </Col>
                        <Col lg={12} style={{padding: 10}}>
                            <p>Доступные объекты для загрузки:</p>
                            <TreeSelect
                                showSearch
                                multiple
                                style={{ width: '100%' }}
                                defaultValue={listForUploads}
                                onChange={(value) => {
                                    props.changeAvailableForUploads({username: user.username, availableForUploads: value})
                                }}
                            >
                                {getAllProjectsList()}
                            </TreeSelect>
                        </Col>
                    </Row>
                </Card>
            )
            });
        return usersCardList
    };

    useEffect(() => {
        props.getAllUsers();
        props.getProjectStructure()
    }, []);

    return (
        <div>
            <Title level={3} style={{marginTop: 50}}>Добавить нового пользователя</Title>
            <Card key='newUser'  style={{marginBottom: 30, backgroundColor: '#fafafa', borderRadius: '5px', textAlign: "left"}}>
                <Row>
                    <Col lg={6} style={{padding: 10}}>
                        <p>Логин:</p>
                        <Input placeholder="Введите логин" value={newLogin} onChange={(e) => {
                            setNewLogin(e.target.value)
                        }}/>
                    </Col>
                    <Col lg={5} style={{padding: 10}}>
                        <p>Тип:</p>
                        <Select value={newType} style={{ width: "100%" }} onChange={(value) => {setNewType(value)}}>
                            <Option value="user">User (Загрузка отчетов)</Option>
                            <Option value="admin">Admin (Полный доступ)</Option>
                            <Option value="manager">Manager (Ограниченный доступ)</Option>
                        </Select>
                    </Col>
                    <Col lg={9} style={{padding: 10}}>
                        <p>Доступные проекты/объекты:</p>
                        <TreeSelect
                            showSearch
                            multiple
                            style={{ width: '100%' }}
                            value={newAvailableProjects}
                            onChange={(value) => {setNewAvailableProjects(value)}}
                        >
                            {getAllProjectsList()}
                        </TreeSelect>
                    </Col>
                    <Col lg={4} style={{padding: 10, textAlign: 'center'}}>
                        <Button block style={{marginTop: 33}} onClick={newUserAction}> <Icon type="plus" /> Добавить </Button>
                    </Col>
                </Row>
            </Card>
            <Title level={3}>Список всех пользователей</Title>
            {props.users.usersList && props.data.projectStructure ?
                userCardsList()
                :null
            }
        </div>
    )
})