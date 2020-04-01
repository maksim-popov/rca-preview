import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {getCurrentMonthInfo} from "../../redux/data";
import { SelectMonth, previousMonth } from "./commons/SelectMonth";
import {Row, Col, Typography, Table, Switch, Button, Icon} from "antd";
const { Title } = Typography;

export const ReportPage = connect(state => state, {getCurrentMonthInfo})((props) => {
    const today = new Date(Date.now());
    const todayMonth = (today.getFullYear().toString())+((0+(today.getMonth()+1).toString()).slice(-2));
    const [currentMonth, setCurrentMonth] = useState(previousMonth(todayMonth));
    const [byProject, setByProject] = useState(true);
    const [share, setShare] = useState(true);
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const rows = [
        {name: 'Доход', code: 'code1000'},
        {name: 'Общепроизводственные рассходы', code: 'code2002'},
        {name: 'ФОТ и налоги на зп', code: 'code2001'},
        {name: 'Аренда офиса', code: 'code2003'},
        {name: 'Другие операционные расходы', code: 'code2005'},
        {name: 'EBITDA', code: 'code6000'},
        {name: 'EBITDA margin', code: 'code7000'},
        {name: 'Амортизация / Возврат инвестиции', code: 'code2006'},
        {name: '% по заемным средствам', code: 'code2004'},
        {name: 'Оплата налогов', code: 'code2007'},
        {name: 'Чистая прибыль', code: 'code3000'},
        {name: 'Доля участия', code: 'code4000'},
        {name: 'Чистая прибыль на долю', code: 'code5000'},
    ];

    function createColumns() {
        let columns = [];
        let availableObjects = props.auth.availableObjects.sort(sortByProject);
        columns.push(        {
            title: 'Позиции',
            dataIndex: 'position',
            key: 'position',
            fixed: 'left',
            width: 270
        });
        if (byProject) {
            availableObjects.forEach((item) => {
                if (!columns.find((el) => (el.key === item.project))) {
                    columns.push({
                        title: item.project,
                        dataIndex: item.project,
                        key: item.project,
                        align: 'right',
                    })
                }
            })
        } else {
            availableObjects.forEach((item) => {
                columns.push({
                    title: item.project + (item.object ? ": " + item.object : ''),
                    dataIndex: item.project + ":" + item.object,
                    key: item.project + ":" + item.object,
                    align: 'right',
                    width: 150,
                })
            })
        }
        columns.push(        {
            title: 'Всего',
            dataIndex: 'total',
            key: 'total',
            fixed: 'right',
            width: 100,
            align: 'right',
        });
        setColumns(columns)
    }

    function createData() {
        let data = [];
        rows.forEach((row) => {
            let dataObj = {total: 0};
            columns.forEach((col, index) => {
                dataObj.key = row.code;
                if (col.dataIndex === 'position') {
                    dataObj.position = row.name;
                } else if (col.dataIndex !== 'total'){
                    if (byProject) {
                        dataObj[col.dataIndex] = 0;
                        props.data.currentMonthInfo.data.forEach((item) => {
                            if (item.status && item.share.projectName === col.dataIndex) {
                                if (share && row.code === 'code5000') {
                                    dataObj[col.dataIndex] += item.data.code3000 * item.data.code4000;
                                    dataObj.total += item.data.code3000 * item.data.code4000
                                } else if (row.code !== 'code4000' && row.code !== 'code6000' && row.code !== 'code7000') {
                                    dataObj[col.dataIndex] += item.data[row.code];
                                    dataObj.total += item.data[row.code]
                                }
                            }
                        });
                    } else {
                        props.data.currentMonthInfo.data.forEach((item) => {
                            if (col.title === item.key && item.status) {
                                if (share && row.code === 'code5000') {
                                    dataObj[col.dataIndex] = item.data.code3000 * item.data.code4000;
                                    dataObj.total += item.data.code3000 * item.data.code4000
                                } else if (row.code !== 'code4000' && row.code !== 'code6000' && row.code !== 'code7000') {
                                    dataObj[col.dataIndex] = item.data[row.code];
                                    dataObj.total += item.data[row.code]
                                }
                            }
                        })
                    }
                }
            });
            if (share || (row.code !== 'code4000' && row.code !== 'code5000')) {data.push(dataObj)}
        });

        for (let key in data[0]) {
            if (key !== 'position' && key !== 'key') {
                if(data[0][key]) {
                    data[5][key] = Math.round((data[0][key] - data[1][key] - data[2][key] - data[3][key] - data[4][key]) * 100) / 100;
                    data[6][key] = Math.round(data[5][key] / data[0][key] * 10000) / 100 + "%";
                } else {
                    data[5][key] = '';
                    data[6][key] = ''
                }
            }
        }

        if (share) {
            data[11].total = '';
            for (let key in data[0]) {
                if (key !== 'position' && key !== 'key' && key !== 'total') {
                    if (byProject) {
                        let svd = 0;
                        let svdnd = 0;
                        props.data.currentMonthInfo.data.forEach((item) => {
                            if (item.status && item.share.projectName === key) {
                                console.log(item);
                                svd += Math.abs(item.data.code3000);
                                svdnd += Math.abs(item.data.code3000*item.data.code4000);
                            }
                        });
                        if (svd && svdnd) {
                            data[11][key] = Math.round(svdnd / svd * 10000) / 100 + "%";
                        } else {
                            data[11][key] = ''
                        }
                    } else {
                        if (data[10][key]) {
                            data[11][key] = Math.round(data[12][key] / data[10][key] * 10000) / 100 + "%";
                        } else {
                            data[11][key] = ''
                        }
                    }
                }
            }
        }

        data.forEach((row) => {
            if (row.key !== 'code4000' && row.key !== 'code7000') {
                for (let key in row) {
                    if (key !== 'position' && key !== 'key') {
                        row[key] = refactorNumber(row[key])
                    }
                }
            }
        });

        setData(data)
    }

    console.log("props.data.currentMonthInfo: ", props.data.currentMonthInfo);
    console.log("data: ", data);

    function refactorNumber(number) {
        if (number) {
            let str = Math.round(number).toString();
            return (str.slice(0, -9) + ' ' + str.slice(-9, -6) + ' ' + str.slice(-6, -3) + ' ' + str.slice(-3))
        } else {
            return ''
        }
    }

    function sortByProject (a, b) {
        if (a.project > b.project) {
            return 1;
        }
        if (a.project < b.project) {
            return -1;
        }
        if (a.object > b.object) {
            return 1;
        }
        if (a.object < b.object) {
            return -1;
        }
        return 0;
    }

    useEffect(() => {
        if (currentMonth) {
            props.getCurrentMonthInfo({month: currentMonth, availableObjects: props.auth.availableObjects.map(item => item.project + ":" + item.object)})
        }
        setData([]);
    }, [currentMonth]);

    useEffect(() => {
        if (columns && props.data.currentMonthInfo.data) {
            createData()
        }
    }, [columns, props.data.currentMonthInfo.data, share]);

    useEffect(() => {
        if (currentMonth) {
            props.getCurrentMonthInfo({month: currentMonth, availableObjects: props.auth.availableObjects.map(item => item.project + ":" + item.object)})
        }
        createColumns();
    }, []);

    useEffect(() => {
            props.getCurrentMonthInfo({month: currentMonth, availableObjects: props.auth.availableObjects.map(item => item.project + ":" + item.object)});
        createColumns();
    }, [byProject]);

    return(
        <div>
            <Title level={3}>Консолидированный отчет</Title>
            <Row>
                <Col lg={8} style={{marginTop: 10}}>
                    <p><Switch defaultChecked onChange={checked => {setByProject(checked)}} /> Группировать по проектам </p>
                    <p><Switch defaultChecked onChange={checked => {setShare(checked)}} /> Отображать долю участия </p>
                </Col>
                <Col lg={8} style={{marginTop: 15}}>
                    {props.data.currentMonthInfo ?
                        <SelectMonth currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} currentMonthName={props.data.currentMonthInfo.name}/>
                        :null
                    }
                </Col>
                <Col lg={8} style={{marginTop: 25}}><Button onClick={() => {props.setTab('excelReport')}}> <Icon type="file-excel"/>Создать excel</Button></Col>
            </Row>
            <Row style={{marginTop: 10}}>
                <Table className='consolidate-report' columns={columns} dataSource={data} pagination={false} scroll={{ x: columns.length*150, y: 0 }} size="small"/>
            </Row>
        </div>
    )
});
