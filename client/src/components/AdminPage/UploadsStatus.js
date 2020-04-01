import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import { Icon, InputNumber, Table } from 'antd';
import {getCurrentMonthInfo, changeShare} from "../../redux/data";
import { SelectMonth, previousMonth } from "./commons/SelectMonth";


const mapStateToProps = (state) => {
    return {...state,}
};


export const UploadsStatus = connect(mapStateToProps, {getCurrentMonthInfo, changeShare})((props) => {
    const today = new Date(Date.now());
    console.log(today.getMonth());
    const todayMonth = (today.getFullYear().toString())+((0+(today.getMonth()+1).toString()).slice(-2));
    const [currentMonth, setCurrentMonth] = useState(previousMonth(todayMonth));

    const columns = [
        {
            title: 'Проект/Объект',
            dataIndex: 'projectName',
            key: 'projectName',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status) {
                    return(<div><Icon style={{color:"limegreen", fontSize: 22}} type="check-circle" /></div>)
                } else {
                    return(<div><Icon style={{fontSize: 22}} type="clock-circle" /></div>)
                }
            },
        },
        {
            title: 'Долевое участие',
            dataIndex: 'share',
            key: 'share',
            render: (share) => {
                if(share) {
                    return (<div>
                        {props.auth.loginStatus === 'admin' ?
                            <InputNumber
                                defaultValue={share.value}
                                min={0}
                                max={100}
                                formatter={value => `${value}%`}
                                parser={value => value.replace('%', '')}
                                onPressEnter={(e) => {
                                    if (+e.currentTarget.value.slice(0, -1) <= 100) {
                                        props.changeShare({
                                            object: share.objectName,
                                            project: share.projectName,
                                            month: currentMonth,
                                            value: +e.currentTarget.value.slice(0, -1),
                                            availableObjects: props.auth.availableObjects.map(item => item.project + ":" + item.object)
                                        })
                                    }
                                }}
                            />
                            :
                            <span>
                                {share.value}%
                            </span>
                        }
                    </div>)
                }
            },
        },
        {
            title: 'Дата загрузки',
            dataIndex: 'uploadDate',
            key: 'uploadDate'
        }
    ];

    useEffect(() => {
            if (currentMonth && props.auth.availableObjects.length) {
                props.getCurrentMonthInfo({month: currentMonth, availableObjects: props.auth.availableObjects.map(item => item.project + ":" + item.object)})
            }
        }, [currentMonth]);

        useEffect(() => {
            if (currentMonth && props.auth.availableObjects.length) {
                props.getCurrentMonthInfo({month: currentMonth, availableObjects: props.auth.availableObjects.map(item => item.project + ":" + item.object)})
            }
        }, []);

    return (
            <div>
                {props.data.currentMonthInfo ?
                    <SelectMonth currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} currentMonthName={props.data.currentMonthInfo.name}/>
                    : null
                }
                {props.data.currentMonthInfo ?
                    <Table style={{marginTop: 20}} pagination={false} showHeader={true} columns={columns} size="small"
                           dataSource={props.data.currentMonthInfo.data}/> : null
                }
            </div>
        )
});