const {months, colors, rows} = require('./constants');
const xl = require('excel4node');

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

function nextMonth (currentMonth) {
    let month = +currentMonth.slice(-2);
    if (month === 12) {
        return ((+currentMonth.slice(0, 4) + 1).toString() + '01')
    } else {
        return (currentMonth.slice(0, 4) + ('0' + (month + 1).toString()).slice(-2))
    }
}

module.exports = {
    createReportArr: function ({byProject, projects, share, firstMonth, lastMonth, projectsMD}) {
        projectsMD = projectsMD.sort(sortByProject);
        if (byProject) {
            projects = projects.map((item) => item.split(':')[0]);
            projects = projects.filter((item, index, self) => self.indexOf(item) === index);
        } else {
            projectsMD = projectsMD.filter((obj) => projects.includes(obj.project + ":" + obj.object));
        }
        let wb = new xl.Workbook();
        let ws = wb.addWorksheet('Sheet 1');
        ws.column(1).setWidth(37);
        ws.cell(1, 1).string("Месяц");
        ws.cell(2, 1).string("Проект");
        rows.forEach((row, index) => {
            if (share || index !== rows.length-1 && index !== rows.length-2) {
                ws.cell(index + 3, 1).string(row.name);
            }
        });
        ws.row(2).setHeight(32);
        let currentColl = 2;
        let currentMonth = firstMonth;
        while (currentMonth <= lastMonth) {
            ws.cell(1, currentColl, 1, (+currentColl+projects.length-1), true).string(months[+currentMonth.slice(-2)-1].name + ' ' + currentMonth.slice(0, 4)).style({alignment: {horizontal: 'center'}, border: {left: {style: 'thin', color: '#888888'}}});
            ws.cell(2, currentColl).style({border: {left: {style: 'thin', color: '#888888'}}});
            if (byProject) {
                projects.forEach((projectName) => {
                    ws.column(currentColl).setWidth(15);
                    ws.cell(2, currentColl).string(projectName).style({
                        alignment: {
                            horizontal: 'center',
                            wrapText: true
                        }
                    });
                    let svd = 0;
                    let svdnd = 0;
                    rows.forEach((row, index) => {
                        if (index !== rows.length - 2) {
                            let data = 0;
                            projectsMD.forEach((obj) => {
                                if (obj.project === projectName && obj.reports[currentMonth] && obj.reports[currentMonth].data.code3000) {
                                    if (row.code !== 'code5000' && row.code !== 'code6000' && row.code !== 'code7000') {
                                        data += obj.reports[currentMonth].data[row.code];
                                        if (row.code === 'code3000') {
                                            svd += Math.abs(obj.reports[currentMonth].data[row.code]);
                                        }
                                    } else if (share && row.code === 'code5000') {
                                        let dnd = obj.reports[currentMonth].data.code3000 * obj.reports[currentMonth].data.code4000;
                                        data += dnd;
                                        svdnd += Math.abs(dnd);
                                    }
                                }
                            });
                            if (data) {
                                ws.cell(index + 3, currentColl).number(data).style({numberFormat: '#,##0'})
                            }
                        }
                    });
                    if (svd) {
                        ws.cell(8, currentColl).formula(`${xl.getExcelCellRef(3, currentColl)}-${xl.getExcelCellRef(4, currentColl)}-${xl.getExcelCellRef(5, currentColl)}-${xl.getExcelCellRef(6, currentColl)}-${xl.getExcelCellRef(7, currentColl)}`).style({numberFormat: '#,##0'});
                        ws.cell(9, currentColl).formula(`${xl.getExcelCellRef(8, currentColl)}/${xl.getExcelCellRef(3, currentColl)}`).style({numberFormat: '0.00%'});
                    }
                    if (share && svd && svdnd) {
                        ws.cell(rows.length + 1, currentColl).number(svdnd/svd).style({numberFormat: '0.00%'})
                    }
                    currentColl++
                });
            } else {
                projectsMD.forEach((obj) => {
                    ws.column(currentColl).setWidth(16);
                    ws.cell(2, currentColl).string(obj.project + (obj.object ? ': ' + obj.object : '')).style({
                        alignment: {
                            horizontal: 'center',
                            wrapText: true
                        }
                    });
                    if (obj.reports[currentMonth] && obj.reports[currentMonth].data.code3000) {
                        rows.forEach((row, index) => {
                            if (index !== rows.length - 1 && row.code !== 'code6000' && row.code !== 'code7000' && obj.reports[currentMonth].data[row.code]) {
                                if (index !== rows.length - 2) {
                                    ws.cell(index + 3, currentColl).number(obj.reports[currentMonth].data[row.code]).style({numberFormat: '#,##0'});
                                } else if (share) {
                                    ws.cell(index + 3, currentColl).number(obj.reports[currentMonth].data[row.code]).style({numberFormat: '0.00%'});
                                }
                            }else if(row.code === 'code6000') {
                                ws.cell(index + 3, currentColl).formula(`${xl.getExcelCellRef(3, currentColl)}-${xl.getExcelCellRef(4, currentColl)}-${xl.getExcelCellRef(5, currentColl)}-${xl.getExcelCellRef(6, currentColl)}-${xl.getExcelCellRef(7, currentColl)}`).style({numberFormat: '#,##0'})
                            }else if (row.code === 'code7000') {
                                ws.cell(index + 3, currentColl).formula(`${xl.getExcelCellRef(8, currentColl)}/${xl.getExcelCellRef(3, currentColl)}`).style({numberFormat: '0.00%'})
                            }
                        });
                        if (share) {
                            ws.cell(rows.length + 2, currentColl).number(obj.reports[currentMonth].data.code3000 * obj.reports[currentMonth].data.code4000).style({numberFormat: '#,##0'});
                        }
                    }
                    currentColl++
                });
            }
            currentMonth = nextMonth(currentMonth);
        }
        ws.cell(1, currentColl).string('Всего').style({alignment: {horizontal: 'center'}, font: {bold: true}, border: {top: {style: 'medium', color: '#000000'}, left: {style: 'medium', color: '#000000'}, right: {style: 'medium', color: '#000000'}}});
        ws.cell(2, currentColl).style({border: {left: {style: 'medium', color: '#000000'}, right: {style: 'medium', color: '#000000'}}});
        if (share) {ws.cell(rows.length + 1, currentColl).style({
            border: {
                left: {style: 'medium', color: '#000000'},
                right: {style: 'medium', color: '#000000'}
            }
        });}
        ws.column(currentColl).setWidth(14);
        rows.forEach((row, index) => {
            if (index !== rows.length-2 && row.code !== 'code6000' && row.code !== 'code7000' && (share || index !== rows.length-1)) {
                ws.cell(index + 3, currentColl).formula(`SUM(${xl.getExcelCellRef(index + 3, 2)}:${xl.getExcelCellRef(index + 3, currentColl - 1)})`).style({numberFormat: '#,##0', border: {left: {style: 'medium', color: '#000000'}, right: {style: 'medium', color: '#000000'}}})
            } else if (row.code === 'code6000') {
                ws.cell(index + 3, currentColl).formula(`${xl.getExcelCellRef(3, currentColl)}-${xl.getExcelCellRef(4, currentColl)}-${xl.getExcelCellRef(5, currentColl)}-${xl.getExcelCellRef(6, currentColl)}-${xl.getExcelCellRef(7, currentColl)}`).style({numberFormat: '#,##0'}).style({border: {left: {style: 'medium', color: '#000000'}, right: {style: 'medium', color: '#000000'}}})
            } else if (row.code === 'code7000') {
                ws.cell(index + 3, currentColl).formula(`${xl.getExcelCellRef(8, currentColl)}/${xl.getExcelCellRef(3, currentColl)}`).style({numberFormat: '0.00%'}).style({border: {left: {style: 'medium', color: '#000000'}, right: {style: 'medium', color: '#000000'}}})
            }
        });
        ws.column(1).freeze(currentColl);
        ws.column(currentMonth).setWidth(30);
        let borders = {
            border: {
                top: {
                    style: 'thin',
                    color: '#000000'
                },
                bottom: {
                    style: 'medium',
                    color: '#000000'
                }
            }
        };
        for (let c = 1; c <= currentColl; c++) {
            ws.cell(2, c).style(borders);
            ws.cell(rows.length, c).style(borders);
            ws.cell(1, c).style({fill: {type: 'pattern', patternType: 'solid', bgColor: '#eeeeee', fgColor: '#eeeeee'}});
            ws.cell(2, c).style({fill: {type: 'pattern', patternType: 'solid', bgColor: '#dddddd', fgColor: '#dddddd'}});
            ws.cell(8, c).style({fill: {type: 'pattern', patternType: 'solid', bgColor: '#eeeeee', fgColor: '#eeeeee'}, border: {top: {style: 'thin', color: '#000000'}, bottom: {style: 'thin', color: '#dddddd'}}});
            ws.cell(9, c).style({fill: {type: 'pattern', patternType: 'solid', bgColor: '#eeeeee', fgColor: '#eeeeee'}, border: {bottom: {style: 'medium', color: '#000000'}}});
            ws.cell(rows.length, c).style({fill: {type: 'pattern', patternType: 'solid', bgColor: '#eeeeee', fgColor: '#eeeeee'}});
            if (share) {
                ws.cell(rows.length+2, c).style(borders);
                ws.cell(rows.length + 2, c).style({
                    fill: {
                        type: 'pattern',
                        patternType: 'solid',
                        bgColor: '#dddddd',
                        fgColor: '#dddddd'
                    }
                });
            }
        }
        return wb
    },

    fileValidation: function (month, file) {
        let data = {code1000: 0, code2000: 0, code2001: 0, code2002: 0, code2003: 0, code2004: 0, code2005: 0, code2006: 0, code2007: 0, code3000: 0};
        let column = '';
        let page = file.Sheets[(file.SheetNames[0])];
        for (let cell in page) {
            if(page[cell].t === 'd') {
                let date = page[cell].v;
                if (date.getFullYear().toString()+'0'+(date.getMonth()+1).toString() === month || date.getFullYear().toString()+(date.getMonth()+1).toString() === month) {
                    if (isNaN(+cell.slice(-2))) {
                        column = cell.slice(0, -1)
                    } else {
                        column = cell.slice(0, -2)
                    }

                }
            }
        }
        if (!column) return {status: false, message: 'Не найдена колонка с необходимым месяцем!'};
        try {
            let rows = {code1000: [], code2000: [], code2001: [], code2002: [], code2003: [], code2004: [], code2005: [], code2006: [], code2007: [], code3000: []};
            for (let cell in page) {
                if (page[cell].t === 's') {
                    for (let code in data) {
                        if (page[cell].v.toLowerCase() === code.toLowerCase()) {
                            rows[code].push(cell.slice(1));
                        }
                    }
                }
            }
            for (let code in rows) {
                if(rows[code].length) {
                    rows[code].forEach(row => {
                        if (page[column+row]) {
                            data[code] += page[column + row].v
                        }
                    })
                }
            }
            data.code2000 = data.code2001+data.code2002+data.code2003+data.code2004+data.code2005+data.code2006+data.code2007;
        } catch (e) {
            console.log(e);
        }
        if (Math.floor(data.code1000-data.code2000) !== Math.floor(data.code3000)) {
            console.log(data);
            return {status: false, message: `Не соответвствие расчетного (${data.code1000-data.code2000}) и табличного (${data.code3000}) значения code3000!`}
        } else if (!data.code1000 && data.code1000 !== 0) {
            console.log(data);
            return {status: false, message: 'Не найдено значение code1000!'}
        } else if  (!data.code2000 && data.code2000 !== 0) {
            console.log(data);
            return {status: false, message: 'Не возможно расчитать значение code2000!'}
        } else {
            return {status: true, data: data}
        }
    },

    createChartInfoByProject: function ({projects, share, firstMonth, lastMonth, projectsMD}) {
        const data = {labels: [], datasets: []};
        let currentMonth = firstMonth;
        while (+currentMonth <= +lastMonth) {
            let index = +(currentMonth.toString().slice(-2)) - 1;
            data.labels.push(months[index].name + ' ' + currentMonth.toString().slice(0,4));
            currentMonth = nextMonth(currentMonth)
        }
        projects.forEach((projectName, index) => {
            let datasetItem = {label: projectName, backgroundColor: colors[index], borderColor: colors[index], fill: false, data: []};
            let currentMonth = firstMonth;
            while (+currentMonth <= +lastMonth) {
                let sum = 0;
                projectsMD.forEach((obj) => {
                    if (projectName === obj.project){
                        if (obj.reports[currentMonth] && obj.reports[currentMonth].data.code3000) {
                            if (share) {
                                sum += Math.round(obj.reports[currentMonth].data.code3000 * obj.reports[currentMonth].data.code4000)
                            } else {
                                sum += Math.round(obj.reports[currentMonth].data.code3000)
                            }
                        }
                    }
                });
                datasetItem.data.push(sum);
                currentMonth = nextMonth(currentMonth)
            }
            data.datasets.push(datasetItem)
        });
        return data
    },

    createChartInfoByObject: function ({projects, share, firstMonth, lastMonth, projectsMD}) {
        projectsMD = projectsMD.sort(sortByProject);
        projectsMD = projectsMD.filter((obj) => projects.includes(obj.project + ":" + obj.object));
        const data = {labels: [], datasets: []};
        let currentMonth = firstMonth;
        while (+currentMonth <= +lastMonth) {
            let index = +(currentMonth.toString().slice(-2)) - 1;
            data.labels.push(months[index].name + ' ' + currentMonth.toString().slice(0,4));
            currentMonth = nextMonth(currentMonth)
        }
        projectsMD.forEach((obj, index) => {
            let datasetItem = {label: obj.project + ': ' + obj.object , backgroundColor: colors[index], borderColor: colors[index], fill: false, data: []};
            let currentMonth = firstMonth;
            while (+currentMonth <= +lastMonth) {
                if (obj.reports[currentMonth] && obj.reports[currentMonth].data.code3000) {
                    if (share) {
                        datasetItem.data.push(Math.round(obj.reports[currentMonth].data.code3000 * obj.reports[currentMonth].data.code4000))
                    } else {
                        datasetItem.data.push(Math.round(obj.reports[currentMonth].data.code3000))
                    }
                } else {
                    datasetItem.data.push(0)
                }
                currentMonth = nextMonth(currentMonth)
            }
            data.datasets.push(datasetItem)
        });
        return data
    }
};
