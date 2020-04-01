import React, {useEffect, useState} from 'react'
import {connect} from "react-redux";
import {addNewObject, deleteObject, getProjectStructure} from "../../redux/data";
import {Col, Row, Tree, Typography, List, Icon, AutoComplete, Button} from "antd";
const { TreeNode } = Tree;
const { Title } = Typography;


export const ProjectManagement = connect(state => state, {getProjectStructure, addNewObject, deleteObject})((props) => {
    const [newProject, setNewProject] = useState('');
    const [newObject, setNewObject] = useState('');

    const getTree = () => {
        let list = [];
        for (let project in props.data.projectStructure.tree) {
            let objectsList = '';
                objectsList = props.data.projectStructure.tree[project].map((object) => {
                    if (object) {
                        return (
                            <TreeNode key={object} title={object}/>
                        )
                    }
                });
            if (objectsList) {
                list.push(<TreeNode title={project} key={project}>{objectsList}</TreeNode>)
            } else{
                list.push(<TreeNode title={project} key={project}/>)
            }
        }
        return list
    };

    const getList = () => {
        if (props.data.projectStructure) {
            let list = props.data.projectStructure.list.map((item) => {
                return (
                    <List.Item
                        actions={[
                            <span style={{color: 'red'}} onClick={() => {props.deleteObject({object: item.object, project: item.project})}}>
                                <Icon type="delete" /> удалить
                            </span>
                        ]}
                    > <span style={{fontWeight: 600}}> {item.project} </span> {item.object} </List.Item>
                )
            });
            return list
        }
    };

    const addNew = () => {
        if (newProject) {
            props.addNewObject({project: newProject, object: newObject});
            setNewProject('');
            setNewObject('');
        }
    };

    useEffect(() => {
        props.getProjectStructure()
    },[]);

    return(
        <div>
            <Row gutter={8} style={{margin: 20}}>
                <Col span={8} style={{textAlign: "left"}}>
                    <Title level={3}>Обзор проектов</Title>
                    {props.data.projectStructure ?
                        <Tree>
                            {getTree()}
                        </Tree>
                        : null
                    }
                </Col>
                <Col span={16} style={{textAlign: "left", maxWidth: "600px"}}>
                    <Title level={3}>Добавить новый проект/объект</Title>
                    <div>
                        <AutoComplete
                            style={{ width: 210, marginRight: 20, marginBottom: 10 }}
                            dataSource={props.data.projectStructure.projectsList}
                            placeholder='Проект'
                            filterOption={(inputValue, option) =>
                                option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                            onChange={(value) => {setNewProject(value)}}
                            value={newProject}
                        />
                        <AutoComplete
                            style={{ width: 210, marginRight: 30, marginBottom: 10 }}
                            placeholder='Объект'
                            filterOption={(inputValue, option) =>
                                option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                            onChange={(value) => {setNewObject(value)}}
                            value={newObject}
                        />
                        <Button onClick={addNew}><Icon type="plus" /> Добавить</Button>
                    </div>
                    <Title level={3} style={{marginTop: 50}}>Все объекты</Title>
                    {props.data.projectStructure ?
                        <List>
                            {getList()}
                        </List>
                        : null
                    }
                </Col>
            </Row>
        </div>
    )
});