import React from 'react'
import {Button, Icon} from "antd";

export function nextMonth (currentMonth) {
    let month = +currentMonth.slice(-2);
    if (month === 12) {
        return ((+currentMonth.slice(0, 4) + 1).toString() + '01')
    } else {
        return (currentMonth.slice(0, 4) + ('0' + (month + 1).toString()).slice(-2))
    }
}

export function previousMonth(currentMonth) {
    let month = +currentMonth.slice(-2);
    if (month === 1) {
        return ((+currentMonth.slice(0, 4) - 1).toString() + '12')
    } else {
        return (currentMonth.slice(0, 4) + ('0' + (month - 1).toString()).slice(-2))
    }
}

export const SelectMonth = ({currentMonth, setCurrentMonth, currentMonthName}) => {

    return (
        <div>
            <div style={{fontSize: 24}}>
                <Button className='arrowsBnt' onClick={() => {
                    setCurrentMonth(previousMonth(currentMonth))
                }}><Icon type="left"/></Button>
                <span style={{width: 170, display: "inline-block"}}> {currentMonthName} </span>
                <Button className='arrowsBnt' onClick={() => {
                    setCurrentMonth(nextMonth(currentMonth))
                }}><Icon type="right"/></Button>
            </div>
        </div>
    )
};