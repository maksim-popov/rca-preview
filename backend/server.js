const {uri, months, API_PORT, salt} = require('./constants');
const {createReportArr, fileValidation, createChartInfoByProject, createChartInfoByObject} = require('./functions');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const XLSX = require('xlsx');
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({storage: storage});
const client = new MongoClient(uri, { useNewUrlParser: true });
const app = express();

client.connect(async () => {
    app.users = client.db("visum_reports").collection("users");
    app.sessions = client.db("visum_reports").collection("sessions");
    app.projects = client.db("visum_reports").collection("projects");
    app.logs = client.db("visum_reports").collection("logs");
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "static/build")));

app.post('/login', async (req, res) => {
    try {
        const user = await app.users.findOne({"username": req.body.username});
        let sessionKey;
        if (user) {
            if (user.password === bcrypt.hashSync(req.body.password, salt) || !user.password) {
                sessionKey = user._id + Date.now();
                await app.sessions.insertOne({sessionKey: sessionKey, userId: user._id});
                if (req.body.remember) {
                    res.cookie('sessionKey', sessionKey, {maxAge: 2592000000})
                } else {
                    res.cookie('sessionKey', sessionKey)
                }
                if (!user.password) {
                    await app.users.updateOne({"username": req.body.username}, {
                        $set: {password: bcrypt.hashSync(req.body.password, salt)}
                    });
                }
                res.send(JSON.stringify({loginStatus: user.role, availableObjects: user.availableObjects, availableForUploads: user.availableForUploads, username: user.username}))
            } else {
                res.send(JSON.stringify({loginStatus: false, message: 'Неверный пароль!'}))
            }
        } else {
            res.send(JSON.stringify({loginStatus: false, message: 'Пользователь не найден!'}))
        }
    } catch (e) {
        res.sendStatus(400)
    }
});

app.get('/logout', async (req, res) => {
    await app.sessions.removeOne({"sessionKey": req.cookies.sessionKey});
    res.clearCookie('sessionKey').clearCookie('basket').send();
});

app.get('/get_login_status', async (req, res) => {
    if (req.cookies.sessionKey) {
        let session = await app.sessions.findOne({sessionKey: req.cookies.sessionKey});
        if (session) {
            let user = await app.users.findOne(session.userId);
            res.send(JSON.stringify({loginStatus: user.role, availableObjects: user.availableObjects, availableForUploads: user.availableForUploads, username: user.username}))
        }
    } else  {
        res.send(JSON.stringify({loginStatus: false}))
    }
});

app.post('/reset_password', async (req, res) => {
    await app.users.updateOne({"username": req.body.username}, {
        $set: {password: ''}
    });
    res.sendStatus(200)
});

app.post('/new_user', async (req, res) => {
    await app.users.insertOne(req.body);
    res.sendStatus(200)
});

app.post('/delete_user', async (req, res) => {
    await app.users.removeOne({username: req.body.username});
    res.sendStatus(200)
});

app.post('/get_current_object_info', async (req, res) => {
    let object = await app.projects.findOne({project: req.body.project, object: req.body.object});
    let response = months.map((month) => {
        let key = req.body.year+month.key;
        if (object.reports[key] && (object.reports[key].data.code1000 || object.reports[key].data.code2000)) {
            return {key: key, month: month.name, status: true, action: {type:'delete', key: key}, uploadDate: object.reports[key].uploadDate}
        } else {
            return {key: key, month: month.name, status: false, action: {type: 'upload', key: key}}
        }
    });
    res.send(JSON.stringify(response));
});

app.post('/get_current_month_info', async (req, res) => {
    let key = req.body.month;
    let objects = await app.projects.find({}).toArray();
    objects = objects.sort(sortByProject);
    let response = {key: key, name: months[+(key.slice(-2)-1)].name + " " + key.slice(0,4), data: []};
    objects.forEach((object) => {
        if (req.body.availableObjects.includes(object.project + ':' + object.object)) {
            let projectName = object.object ? (object.project + ': ' + object.object) : object.project;
            if (object.reports[key] && (object.reports[key].data.code1000 || object.reports[key].data.code2000)) {
                response.data.push({
                    key: projectName,
                    projectName: projectName,
                    status: true,
                    data: object.reports[key].data,
                    share: {
                        value: object.reports[key].data.code4000 * 100,
                        objectName: object.object,
                        projectName: object.project
                    },
                    uploadDate: object.reports[key].uploadDate.toLocaleString("ru", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    })
                })
            } else {
                response.data.push({
                    key: projectName,
                    projectName: projectName,
                    status: false,
                    share: {
                        value: object.reports[key] ? object.reports[key].data.code4000 * 100 : 100,
                        objectName: object.object,
                        projectName: object.project
                    }
                })
            }
        }
    });
    res.send(JSON.stringify(response));
});

app.post('/change_share', async (req, res) => {
    let key = req.body.month;
    let objectMD = await app.projects.findOne({object: req.body.object, project: req.body.project});
    if (objectMD.reports[key]) {
        objectMD.reports[key].data.code4000 = (req.body.value / 100);
    } else {
        objectMD.reports = {...objectMD.reports, [key]: {data: {code4000: (req.body.value / 100)}}}
    }
    await app.projects.updateOne({project: req.body.project, object: req.body.object}, {
        $set: {
            reports: objectMD.reports
        }
    });
    res.send(JSON.stringify(objectMD));
});

app.post('/file', upload.single('file'), async (req, res) => {
    let period = (new Date(Date.now())).getFullYear().toString() + ((new Date(Date.now())).getMonth() + 1).toString();
    if (period.length === 5) period = period.slice(0,4) + '0' +  period.slice(-1);
    let book = XLSX.readFile(req.file.path, {cellDates: true});
    let validData = fileValidation(req.body.month, book);
    if(validData.status) {
        await writeData(req.body.project, req.body.object, req.body.month, validData.data);
        await app.logs.insertOne({date: Date.now(), period: period, report: req.body.project + ": " + req.body.object + ' ('+req.body.month.slice(0,4)+"-"+req.body.month.slice(-2)+')', username: req.body.username, action: "success upload"});
        res.send();
    } else {
        await app.logs.insertOne({date: Date.now(), period: period, report: req.body.project + ": " + req.body.object + ' ('+req.body.month.slice(0,4)+"-"+req.body.month.slice(-2)+')', username: req.body.username, action: "failed upload"});
        res.status(400).send(JSON.stringify(validData));
    }
});

app.post('/delete_report', async (req, res) => {
    let object = await app.projects.findOne({object: req.body.object, project: req.body.project});
    for (let key in object.reports[req.body.month].data) {
        if (key !== 'code4000') object.reports[req.body.month].data[key] = 0;
    };
    await app.projects.updateOne({object: req.body.object, project: req.body.project}, {
        $set: {
            reports: object.reports
        }
    });
    let period = (new Date(Date.now())).getFullYear().toString() + ("0" +((new Date(Date.now())).getMonth()+1).toString()).slice(-2);
        await app.logs.insertOne({date: Date.now(), period: period, report: req.body.project + ": " + req.body.object + ' ('+req.body.month.slice(0,4)+"-"+req.body.month.slice(-2)+')', username: req.body.username, action: "delete"});
    res.sendStatus(200)
});

app.get('/get_project_structure', async (req, res) => {
    let objects = await app.projects.find({}).toArray();
    let tree = {};
    objects.forEach((object) => {
        if (tree[object.project]) {
            tree[object.project].push(object.object)
        } else {
            tree[object.project] = [object.object]
        }
    });
    let projectsList = [];
    for (let key in tree) projectsList.push(key);
    let list = [];
    objects.forEach((object) => {
        list.push({project: object.project, object: object.object})
    });
    res.send(JSON.stringify({tree: tree, list: list, projectsList: projectsList}));
});

app.post('/add_new_object', async (req, res) => {
    await app.projects.insertOne({
        project: req.body.project,
        object: req.body.object,
        reports: {}
    });
    res.sendStatus(200)
});

app.post('/delete_object', async (req, res) => {
    await app.projects.removeOne({
        project: req.body.project,
        object: req.body.object,
    });
    let users = await app.users.find({}).toArray();
    users.forEach((user) => {
       user.availableObjects.forEach(async (item, index) => {
           if (req.body.project === item.project && req.body.object === item.object) {
               user.availableObjects.splice(index, 1);
               await app.users.updateOne({username: user.username}, {
                   $set: {availableObjects: user.availableObjects}
               })
           }
       });
       user.availableForUploads.forEach(async (item, index) => {
           if (req.body.project === item.project && req.body.object === item.object) {
               user.availableForUploads.splice(index, 1);
               await app.users.updateOne({username: user.username}, {
                   $set: {availableForUploads: user.availableForUploads}
               })
           }
       });
    });
    res.sendStatus(200)
});

app.get('/get_all_users', async (req, res) => {
   let userList = await app.users.find({}).toArray();
   res.send(JSON.stringify(userList))
});

app.post('/change_available_projects', async (req, res) => {
   let newAvailableProjects = [];
    req.body.availableProjects.forEach((item) => {
        newAvailableProjects.push({
            project: item.split(':')[0],
            object: item.split(':')[1] ? item.split(':')[1] : ''
        })
    });
    await app.users.updateOne({username: req.body.username}, {
        $set: {
            availableObjects: newAvailableProjects
        }
    });
    res.sendStatus(200)
});

app.post('/change_available_for_uploads', async (req, res) => {
   let newAvailableForUploads = [];
    req.body.availableForUploads.forEach((item) => {
        newAvailableForUploads.push({
            project: item.split(':')[0],
            object: item.split(':')[1] ? item.split(':')[1] : ''
        })
    });
    await app.users.updateOne({username: req.body.username}, {
        $set: {
            availableForUploads: newAvailableForUploads
        }
    });
    res.sendStatus(200)
});

app.post('/create_excel', async (req, res) => {
    let projectsMD = await app.projects.find({}).toArray();
    let finalReportBook;
    finalReportBook =  createReportArr({...req.body, projectsMD});
    finalReportBook.write('Excel.xlsx', res);
});

app.post('/get_history', async (req, res) => {
    let history = await app.logs.find({period: req.body.period}).toArray();
    res.send(JSON.stringify(history.reverse()));
});

app.post('/get_chart_info', async (req, res) => {
    let projectsMD = await app.projects.find({}).toArray();
    let result;
    if (req.body.byProject) {
        let projects = req.body.projects.map((item) => item.split(':')[0]);
        projects = projects.filter((item, pos, self) => self.indexOf(item) === pos);
        result = createChartInfoByProject({...req.body, projectsMD, projects});
    } else {
        result = createChartInfoByObject({...req.body, projectsMD});
    }
    res.send(JSON.stringify(result));
});

app.use('/', (req, res) => res.sendFile(path.join(__dirname, 'static/build/index.html')));

app.listen(API_PORT, () => console.log(`Server listening on port ${API_PORT}`));

async function writeData(project, object, month, data) {
    let objectMD = await app.projects.findOne({project: project, object: object});
    let item = {data: data, uploadDate: new Date(Date.now())};
    if (objectMD.reports[month]) {
        item.data = {...item.data, code4000: objectMD.reports[month].data.code4000}
    } else {
        item.data = {...item.data, code4000: 1}
    }
    objectMD.reports = {...objectMD.reports, [month]: item};
    await app.projects.updateOne({project: project, object: object}, {
        $set: {
            reports: objectMD.reports
        }
    })
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