const express = require('express');
const app = express();
const moment = require('moment');
const session = require('express-session');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const PORT = 3000;
app.use(express.static('public'));
// bodyの取得設定
app.use(bodyParser.urlencoded({
    extended: true
}));
// セッション設定
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 30
    }
}));
// ニックネームの格納用変数
let my = {
    name: null,
    token: null
};
// user一覧
let member = [];

// 実験



// url GET
app.get('/',(req,res) => {
    res.render('index.ejs');
});
app.get('/chatroom',(req,res) => {
    if(my.name == undefined || my.name == null) {
        res.redirect('/');
    } else {
        res.render('chat.ejs', {name: my.name});
    }
});

// url POST 
app.post('/name',(req,res) => {
    my.name = req.body.name;
    let flag = true;
    member.forEach(element => {
        if(element.name == my.name) {
            flag = false;
        }
    });
    if(flag) {
        res.redirect('/chatroom');
    } else {
        res.redirect('/');
    }
});

// サーバーと紐づけ アクション待ち
io.on('connection', (socket) => {
    // リロード対策のif   リロード時にmy.nameをnull（詳しくはdisconnectionをチェック）にしているのでリロードした人はこの処理が出来ない
    if(my.name != null) {
        my.token = socket.id;
        let obj = {id: my.token, name: my.name};
        member.push(obj);
    }
    // メッセージ受信　　一斉送信
    socket.on('message',(msg) => {
        io.emit('message', {msg: msg, time: moment().format('HH:mm')});
    });
    // ルームに入ってロード（準備）が終わったら
    socket.once('Done',(msg) => {
        socket.broadcast.emit('chatIn', {name: msg.name, token: my.token,time: moment().format('HH:mm')});
        io.to(my.token).emit('token',{token: my.token,member: member});
    });
    // 退出処理
    socket.on('disconnect', (data) => {
        const exitName = sp(socket.id);
        deleteMem(socket.id);
        my.name = null;
        my.token = null;
        socket.broadcast.emit('exit',{name: exitName,time: moment().format('HH:mm')});
    });
});

// 退出した人を特定する関数
const sp = (id) => {
    for (let index = 0; index < member.length; index++) {
        const element = member[index];
        if(element.id == id) {
            return element.name;
        }
    }
}
// 退出した人をmemberから消した新しい配列を作る関数
const deleteMem = (id) => {
    member = member.filter(user => user.id != id)
} 

// サーバー起動
http.listen(PORT,() => {
    console.log('サーバー起動');
});