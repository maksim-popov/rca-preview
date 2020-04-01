import React, {useEffect, useState} from 'react'
import {connect} from "react-redux";
import {Button, Row, Icon, Typography, Col, Switch, TreeSelect, Steps} from "antd";
import {SelectMonth} from "./commons/SelectMonth";
import {createExcel} from "../../redux/data";
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
const rows = [
    {name: 'Доход', code: 'code1000'},
    {name: 'Общепроизводственные рассходы', code: 'code2002'},
    {name: 'ФОТ и налоги на зп', code: 'code2001'},
    {name: 'Аренда офиса', code: 'code2003'},
    {name: 'Другие операционные расходы', code: 'code2005'},
    {name: 'Амортизация / Возврат инвестиции', code: 'code2006'},
    {name: '% по заемным средствам', code: 'code2004'},
    {name: 'Оплата налогов', code: 'code2007'},
    {name: 'Чистая прибыль', code: 'code3000'},
    {name: 'Доля участия', code: 'code4000'},
    {name: 'Чистая прибыль на долю', code: 'code5000'},
];

export const ExcelReport = connect(state => state, {createExcel})((props) => {
    const today = new Date(Date.now());
    const todayMonth = (today.getFullYear().toString())+((0+(today.getMonth()+1).toString()).slice(-2));
    const [firstMonth, setFirstMonth] = useState(todayMonth);
    const [lastMonth, setLastMonth] = useState(todayMonth);
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
            setFirstMonth(firstMonth)
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

    return (
        <div>
            <Row>
                <Col lg={6} style={{marginTop: 10}}><div style={{textAlign: "left"}}><Button onClick={() => {props.setTab('report')}}><Icon type="arrow-left" /> Назад</Button></div></Col>
                <Col lg={12} style={{marginTop: 10}}><Title level={3}>Создать отчет в excel</Title></Col>
                <Col lg={6}> </Col>
            </Row>
            <Row style={{marginTop: 30}}>
                <Col lg={8}>
                    <Title level={4}>Настройки</Title>
                    <div style={{marginTop: 30, paddingLeft: 20, textAlign: "left"}}>
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
                    <Title level={4}>Период</Title>
                    <p style={{fontSize: 18, marginBottom: 0, marginTop: 20}}>Первый месяц: </p>
                    <SelectMonth currentMonth={firstMonth} setCurrentMonth={validFirstMonth} currentMonthName={months[(firstMonth.slice(4)-1)].name + ' ' + firstMonth.slice(0,4)}/>
                    <p style={{fontSize: 18, marginBottom: 0, marginTop: 20}}>Последний месяц: </p>
                    <SelectMonth currentMonth={lastMonth} setCurrentMonth={validLastMonth} currentMonthName={months[(lastMonth.slice(4)-1)].name + ' ' + lastMonth.slice(0,4)}/>

                </Col>
                <Col lg={8}>
                    <Title level={4}>Загрузка</Title>
                    <div style={{marginTop: 30, fontSize: 18}}>
                        <Button size='large' onClick={() => {
                            props.createExcel({
                                byProject: byProject,
                                projects: projects,
                                share: share,
                                firstMonth: firstMonth,
                                lastMonth: lastMonth
                            })
                        }}> <Icon type="cloud-download"/>Скачать файл</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col style={{marginTop: 15, fontSize: 18}}>

                </Col>
            </Row>
            <Row>
                <Col style={{marginTop: 50, fontSize: 18}}>

                </Col>
            </Row>
        </div>
    )
});
