import React, {useState} from 'react';
import { Menu, Icon } from 'antd';
import {UploadsStatus} from "./AdminPage/UploadsStatus";
import {ReportPage} from "./AdminPage/ReportPage";
import {ExcelReport} from "./AdminPage/ExcelReport";
import {Charts} from "./AdminPage/Charts";
import {UploadPage} from "./UploadPage";

export const ManagerPage = (props) => {
    const [tab, setTab] = useState('uploadsStatus');

    const tabsClick = (e) => {
        setTab(e.key,);
    };

    const renderPage = () => {
        switch (tab) {
            case 'uploadsStatus':
                return <UploadsStatus />;
            case 'report':
                return <ReportPage setTab={setTab}/>;
            case 'excelReport':
                return <ExcelReport setTab={setTab}/>;
            case 'graphs':
                return <Charts/>;
            case 'upload':
                return <UploadPage/>;
        }
    };

    return (
        <div>
            <Menu onClick={tabsClick} selectedKeys={[tab]} mode="horizontal" style={{ marginBottom: '50px'}}>
                <Menu.Item key="uploadsStatus" style={{ fontSize: '18px'}}>
                    <Icon type="file-done" style={{ fontSize: '20px'}}/>
                    Статусы загрузок
                </Menu.Item>
                <Menu.Item key="report" style={{ fontSize: '18px'}}>
                    <Icon type="table" style={{ fontSize: '20px'}}/>
                    Отчет
                </Menu.Item>
                <Menu.Item key="graphs" style={{ fontSize: '18px'}}>
                    <Icon type="bar-chart" style={{ fontSize: '20px'}}/>
                    Графики
                </Menu.Item>
                <Menu.Item key="upload" style={{ fontSize: '18px'}}>
                    <Icon type="cloud-upload" style={{ fontSize: '20px'}}/>
                    Загрузка
                </Menu.Item>
            </Menu>
            {renderPage()}
        </div>
    )
};

