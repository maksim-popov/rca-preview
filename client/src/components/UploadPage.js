import React, {useEffect, useState} from 'react';
import { Select, Button, Icon, InputNumber, Table, Alert, Upload, message} from 'antd';
import {clearCurrentObjectInfo, deleteReport, getCurrentObjectInfo} from "../redux/data";
import {connect} from "react-redux";
const { Option } = Select;


export const UploadPage = connect(state => state, {getCurrentObjectInfo, deleteReport, clearCurrentObjectInfo})((props) => {
    const [currentObject, setCurrentObject] = useState('');
    const [year, setYear] = useState((new Date(Date.now())).getFullYear());
    const [currentObjectInfo, setCurrentObjectInfo] = useState('');

    function onChangeObject(value) {
        setCurrentObjectInfo('');
        console.log(`selected ${value}`);
        setCurrentObject(value)
    }

    function onChangeYear(value) {
        setCurrentObjectInfo('');
        console.log('changed', value);
        setYear(value)
    }

    function beforeUpload(file) {
        const isXLSX = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || "application/vnd.ms-excel";
        if (!isXLSX) {
            message.error('Не верный формат файла');
        }
        return isXLSX
    }

    const columns = [
        {
            title: 'Месяц',
            dataIndex: 'month',
            key: 'month',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status) {
                    return(<div><Icon style={{color:"limegreen", fontSize: 26}} type="check-circle" /></div>)
                } else {
                    return(<div><Icon style={{fontSize: 26}} type="clock-circle" /></div>)
                }
            },
        },
        {
            title: 'Действие',
            dataIndex: 'action',
            key: 'action',
            render: (action) => {
                if (action.type === 'upload') {
                    return(<div>
                        <Upload
                            beforeUpload={beforeUpload}
                            action={'/file'}
                            data={{project: currentObject.split(':')[0], object: currentObject.split(':')[1], month: action.key, username: props.auth.username}}
                            onChange={ async (info) => {
                                if (info.file.status !== 'uploading') {

                                }
                                if (info.file.status === 'done') {
                                    message.success(`Файл успешно загружен`);
                                    props.getCurrentObjectInfo({project: currentObject.split(':')[0], object: currentObject.split(':')[1], year: year})
                                } else if (info.file.status === 'error') {
                                    console.log(info);
                                    message.error(`Не удаловь загрузить файл.`);
                                    message.error(info.file.response.message);
                                }
                            }
                            }>
                            <Button>
                                <Icon type="upload" /> Загрузить файл
                            </Button>
                        </Upload>
                    </div>)
                } else if (action.type === 'delete') {
                    return (<Button type="danger" ghost onClick={() => {
                        props.deleteReport({project: currentObject.split(':')[0], object: currentObject.split(':')[1], year: year, month: action.key, username: props.auth.username})
                    }}><Icon type="delete"/> Удалить</Button>)
                }
            }
        }];

    useEffect(() => {
        if (currentObject) {
            props.getCurrentObjectInfo({project: currentObject.split(':')[0], object: currentObject.split(':')[1], year: year})
        }
    },[currentObject, year]);

    useEffect(() => {
        setCurrentObjectInfo(props.data.currentObjectInfo)
    }, [props.data.currentObjectInfo]);

    useEffect(() => () => {
        props.clearCurrentObjectInfo();
        }, []);

    return (
        <div>
            <h1 className='page-title'>
                Загрузка отчета
            </h1>
            <span className='input-label'>Проект:</span>
            <Select value={currentObject} style={{ width: 200, marginRight: 50 }} onChange={onChangeObject}>
                {props.auth.availableForUploads ?
                    props.auth.availableForUploads.map((item) => {
                    return (<Option value={item.project + ':' + item.object} key={item.project + item.object}>{item.project + (item.object ? ': ' + item.object : '')}</Option>)
                    }) : null
                }
            </Select>
            <span className='input-label'>Год:</span>
            <InputNumber min={2019} max={2029} defaultValue={year} onChange={onChangeYear} />
            {props.data.currentObjectInfo ?
                <Table className='upload-table' pagination={false} showHeader={true} columns={columns} style={{textAlign: "center"}}
                       dataSource={currentObjectInfo}/> : null
            }
        </div>
    );
});

