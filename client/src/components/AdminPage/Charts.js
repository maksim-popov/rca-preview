import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {Row, Col, Typography, Table, Switch, Button, Icon, TreeSelect} from "antd";
import {Line} from 'react-chartjs-2';
import {SelectMonth} from "./commons/SelectMonth";
import {getChartInfo} from "../../redux/data";
const { Title } = Typography;
const { TreeNode } = TreeSelect;
const months = [
    {key: "01", name: "Январь"},
    {key: "02", name: "Февраль"},
    {key: "03", name: "Март"},
    {key: "04", name: "Апрель"},
    {key: "05", name: "Май"},
    {key: "06", name: "Июнь"},
    {key: "07", name: "Июль"},
    {key: "08", name: "Август"},
    {key: "09", name: "Сентябрь"},
    {key: "10", name: "Октябрь"},
    {key: "11", name: "Ноябрь"},
    {key: "12", name: "Декабрь"}
];
const colors = [
    "rgb(117,106,111)",
    "rgb(163,195,168)",
    "rgb(174,186,230)",
    "rgb(255,174,254)",
    "rgb(255,191,150)",
    "rgb(255,128,172)",
    "rgb(138,124,255)",
    "rgb(158,91,75)",
    "rgb(133,105,55)",
    "rgb(82,212,104)",
    "rgb(193,193,56)",
    "rgb(210,70,255)",
    "rgb(53,150,246)",
    "rgb(195,40,149)",
    "rgb(255,87,46)",
    "rgb(37,200,255)",
    "rgb(213,27,60)",
    "rgb(255,123,0)",
    "rgb(255,166,0)",
    "rgb(74,122,0)",
    "rgb(0,255,0)",
    "rgb(0,139,109)",
    "rgb(0,255,250)",
    "rgb(0,132,146)"];

export const Charts = connect(state => state, {getChartInfo})((props) => {
    const today = new Date(Date.now());
    const [firstMonth, setFirstMonth] = useState(today.getFullYear().toString()+'01');
    const [lastMonth, setLastMonth] = useState(today.getFullYear().toString()+'12');
    const [byProject, setByProject] = useState(true);
    const [share, setShare] = useState(true);
    const [changeProjects, setChangeProjects] = useState(true);
    const [projects, setProjects] = useState(props.auth.availableObjects.map(item => item.project + ":" + item.object));

    function validLastMonth(lastMonth) {
        if (+firstMonth <= +lastMonth) {
            setLastMonth(lastMonth)
        }
    }

    function validFirstMonth(firstMonth) {
        if (+firstMonth <= +lastMonth) {
            setFirstMonth(firstMonth);
        } else {
            setFirstMonth(firstMonth);
            setLastMonth(firstMonth)
        }
    }

    function getAllProjectsList() {
        let treeList = [];
        props.auth.availableObjects.forEach((item) => {
            treeList.push(<TreeNode value={item.project + ":" + item.object} title={item.project + " " + item.object} key={item.project + item.object}/>)
        });
        return treeList
    }

    useEffect(() => {
        props.getChartInfo({
            byProject: byProject,
            projects: projects,
            share: share,
            firstMonth: firstMonth,
            lastMonth: lastMonth,
        })
    }, []);

    useEffect(() => {
        props.getChartInfo({
            byProject: byProject,
            projects: projects,
            share: share,
            firstMonth: firstMonth,
            lastMonth: lastMonth,
        })
    }, [byProject, projects, share, firstMonth, lastMonth]);

    return (
        <div>
            <Title level={3} style={{marginTop: 10}}>Графики</Title>
            <Row style={{marginTop: 10, marginBottom: 30}}>
                <Col lg={8}>
                    <div style={{marginTop: 60, paddingLeft: 20, textAlign: "left"}}>
                        <p><Switch defaultChecked onChange={checked => {setByProject(checked)}} /> Группировать по проектам </p>
                        <p><Switch defaultChecked onChange={checked => {setShare(checked)}} /> Отображать долю участия </p>
                        <p><Switch defaultChecked onChange={checked => {setChangeProjects(checked)}} /> Выбрать все проекты </p>
                        {!changeProjects ?
                            <Col style={{marginTop: 10, fontSize: 18}}>
                                <TreeSelect
                                    showSearch
                                    multiple
                                    style={{maxWidth: 600}}
                                    value={projects}
                                    onChange={(value) => {
                                        setProjects(value)
                                    }}
                                >
                                    {getAllProjectsList()}
                                </TreeSelect>
                            </Col>
                            : null
                        }
                    </div>
                </Col>
                <Col lg={8}>
                    <p style={{fontSize: 18, marginBottom: 0, marginTop: 20}}>Первый месяц: </p>
                    <SelectMonth currentMonth={firstMonth} setCurrentMonth={validFirstMonth} currentMonthName={months[(firstMonth.slice(4)-1)].name + ' ' + firstMonth.slice(0,4)}/>
                    <p style={{fontSize: 18, marginBottom: 0, marginTop: 20}}>Последний месяц: </p>
                    <SelectMonth currentMonth={lastMonth} setCurrentMonth={validLastMonth} currentMonthName={months[(lastMonth.slice(4)-1)].name + ' ' + lastMonth.slice(0,4)}/>

                </Col>
            </Row>
            <Line data={props.data.chartInfo} />
        </div>
    )
});