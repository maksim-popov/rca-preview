import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {Typography, Table, Icon} from "antd";
import {getHistory} from "../../redux/data";
import {SelectMonth} from "./commons/SelectMonth";
const { Title } = Typography;
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


export const HistoryPage = connect(state => state, {getHistory})((props) => {
    const [currentMonth, setCurrentMonth] = useState((new Date(Date.now())).getFullYear().toString() + ("0" +((new Date(Date.now())).getMonth()+1).toString()).slice(-2));

    const columns = [
        {
            title: 'Время - Дата',
            dataIndex: 'date',
            key: 'date',
            render: (date) => {
                let dateObj = new Date(date);
                let minutes = dateObj.getMinutes();
                if (+minutes < 10) {minutes = '0' + minutes}
                return (dateObj.getHours() + ":" + minutes + ' - ' + dateObj.getDate() + "/" +(dateObj.getMonth()+1)+ "/" +dateObj.getFullYear())
            },
        },
        {
            title: 'Пользователь',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'Отчет',
            dataIndex: 'report',
            key: 'report',
        },
        {
            title: 'Событие',
            dataIndex: 'action',
            key: 'action',
            render: (action) => {
                switch (action) {
                    case "success upload":
                        return (<div><Icon type="check"  style={{color: "green"}}/>  - Удачная загрузка </div>);
                    case "failed upload":
                        return (<div><Icon type="warning"  style={{color: "orange"}}/>  - Неудачная загрузка </div>);
                    case "delete":
                        return (<div><Icon type="close"  style={{color: "red"}}/>  - Удаление отчета </div>);
                }
            },
        }
        ];

    useEffect(() => {
        props.getHistory({period: currentMonth})
    },[]);

    useEffect(() => {
        props.getHistory({period: currentMonth})
    },[currentMonth]);

    return (
       <div>
           <Title level={3}>История загрузок</Title>
           <SelectMonth currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} currentMonthName={months[(+currentMonth.slice(4)-1)].name + ' ' + currentMonth.slice(0,4)}/>
           {props.data.history ?
               <Table style={{marginTop: 10}} columns={columns} dataSource={props.data.history} pagination={false} size="small"/>
               : null
           }
       </div>
   )
});