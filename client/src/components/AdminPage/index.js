import React, {useState} from 'react';
import { Menu, Icon } from 'antd';
import {UploadsStatus} from "./UploadsStatus";
import {ProjectManagement} from "./ProjectManagement";
import {UsersPage} from "./UsersPage";
import {ReportPage} from "./ReportPage";
import {UploadPage} from "../UploadPage";
import {ExcelReport} from "./ExcelReport";
import {HistoryPage} from "./HistoryPage";
import {Charts} from "./Charts";

export const AdminPage = (props) => {
    const [tab, setTab] = useState('uploadsStatus');

    const tabsClick = (e) => {
        setTab(e.key,);
    };

    const renderPage = () => {
        switch (tab) {
            case 'uploadsStatus':
                return <UploadsStatus />;
            case 'projectsMap':
                return <ProjectManagement />;
            case 'usersMap':
                return <UsersPage />;
            case 'report':
                return <ReportPage setTab={setTab}/>;
            case 'excelReport':
                return <ExcelReport setTab={setTab}/>;
            case 'graphs':
                return <Charts/>;
            case 'history':
                return <HistoryPage/>;
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
                <Menu.Item key="projectsMap" style={{ fontSize: '18px'}}>
                    <Icon type="deployment-unit" style={{ fontSize: '20px'}}/>
                    Проекты
                </Menu.Item>
                <Menu.Item key="usersMap" style={{ fontSize: '18px'}}>
                    <Icon type="team" style={{ fontSize: '20px'}}/>
                    Пользователи
                </Menu.Item>
                <Menu.Item key="report" style={{ fontSize: '18px'}}>
                    <Icon type="table" style={{ fontSize: '20px'}}/>
                    Отчет
                </Menu.Item>
                <Menu.Item key="graphs" style={{ fontSize: '18px'}}>
                    <Icon type="bar-chart" style={{ fontSize: '20px'}}/>
                    Графики
                </Menu.Item>
                <Menu.Item key="history" style={{ fontSize: '18px'}}>
                    <Icon type="history" style={{ fontSize: '20px'}}/>
                    История
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

