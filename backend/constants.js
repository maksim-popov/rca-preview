module.exports = {
    uri: " ",
    months: [{key: "01", name: "Январь"}, {key: "02", name: "Февраль"}, {key: "03", name: "Март"}, {key: "04", name: "Апрель"}, {key: "05", name: "Май"}, {key: "06", name: "Июнь"}, {key: "07", name: "Июль"}, {key: "08", name: "Август"}, {key: "09", name: "Сентябрь"}, {key: "10", name: "Октябрь"}, {key: "11", name: "Ноябрь"}, {key: "12", name: "Декабрь"}],
    colors: [
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
        "rgb(0,132,146)"],
    API_PORT: process.env.PORT || 9000,
    salt: ' ',
    rows: [
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
    ]
}
