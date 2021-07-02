let socket = io();
// 最初Tokenを受け取る
socket.on('token', (msg) => {
    body.setAttribute('token',msg.token);
    $token = body.getAttribute('token');
    msg.member.forEach(element => {
        nameListCreate(element.name);
    });
});
const body = document.querySelector('body');
const $name = body.getAttribute('name');
let $token = body.getAttribute('token');
const $btn = document.querySelector('.main_form-btn');
const $formMessage = document.querySelector('.main_form-message');
const $contents = document.querySelector('.main_contents');
const $content = document.querySelector('.main_contents_content');
const $nameList = document.querySelector('.header_namelist');
// 実験

// namelistの要素を作る関数
const nameListCreate = (name) => {
    // nameListの要素を作る
    let nameContent = document.createElement('li');
    let nameContentSan = document.createElement('span');
    // nameListの要素にクラスを与える
    nameContent.classList.add('header_namelist-content');
    nameContentSan.classList.add('header_namelist-content-san');
    // namelistの要素に内容を入れる
    if(name === null) {
        nameContent.textContent = '名無し'
    } else {
        nameContent.textContent = name;
    }
    nameContentSan.textContent = 'さん';
    // nameContentSanを追加
    nameContent.appendChild(nameContentSan);
    $nameList.appendChild(nameContent);
};

// 入室処理
// 誰かが入室したら名前を受け取る
socket.on('chatIn', (data) => {
    nameListCreate(data.name);
    // 入室メッセージ
    masterMsg(data.name,data.time,1);
});

// 退出処理
// 誰かが退出したらそいつをnamelistから消す
socket.on('exit', (data) => {
    let deleteElems = document.querySelectorAll('.header_namelist-content');
    for (let index = 0; index < deleteElems.length; index++) {
        const element = deleteElems[index];
        // 名前の「さん」を消す
        const txt = element.textContent.slice(0,-2);
        if(txt == data.name) {
            deleteElems[index].remove();
        }
    }
    // 退室メッセージ
    masterMsg(data.name,data.time,2);
})

//メッセージ送信イベント
$btn.addEventListener('click', (e) => {
    e.preventDefault();
    const flag = spaceCheck(value());
    if(flag) {
        socket.emit('message', {value: value(), name: $name, token: $token});
        // 高さと内容（value）をリセット
        $formMessage.value = '';
        $formMessage.setAttribute('rows',1);
    } else {
        // 高さと内容（value）をリセット
        $formMessage.value = '';
        $formMessage.setAttribute('rows',1);
        window.alert('入力欄に文字が入力されていません');
    }
})
// メッセージの中身（value）を返す関数
const value = () => {
    return $formMessage.value;
}
// 空白チェック
const spaceCheck = (value) => {
    const NGs = [' ','　',/\n/];
    let deleteSpace = value;
    for (let index = 0; index < NGs.length; index++) {
        deleteSpace = deleteSpace.split(NGs[index]).join('');
    }
    if(deleteSpace == '') {
        // 空だったらfalseを返す
        return false;
    } else {
        // 空じゃなかったらtrueを返す
        return true;
    }
}
// textareaがkeydownされた時（エンターを押された時に改行する）
$formMessage.addEventListener('keydown', (e) => {
    // keyCode１３はEnterエンターを押された時
    if(e.keyCode == 13) {
        let lineHeight = Number($formMessage.getAttribute('rows'));
        lineHeight++;
        $formMessage.setAttribute('rows', lineHeight);
    }
});

// textareaがkeyupされた時（文字が改行出来るまで横幅が伸びた時）
$formMessage.addEventListener('keyup', (e) => {
    changeHeight();
})

// 改行する関数
const changeHeight = () => {
    // 高さを1にしてリセット
    $formMessage.setAttribute('rows', 1);
    let lineHeight = Number($formMessage.getAttribute("rows"));
    while ($formMessage.scrollHeight > $formMessage.offsetHeight){
        lineHeight++;
        $formMessage.setAttribute("rows", lineHeight);
    }
}

// メッセージ受信処理
socket.on('message',(msg) => {
    // メッセージの要素を作成
    let content = document.createElement('div'); 
    let contentName = document.createElement('span');
    let contentDate = document.createElement('span');
    let contentMessage = document.createElement('p');
    let contentBtn = document.createElement('p');
    let contentMore = document.createElement('p');
    // メッセージの要素にクラスを与える
    if(msg.msg.token == $token) {
        content.classList.add('my-message');
    }
    content.classList.add('main_contents_content');
    contentName.classList.add('main_contents_content-name');
    contentDate.classList.add('main_contents_content-date');
    contentMessage.classList.add('main_contents_content-msg');
    contentBtn.classList.add('main_contents_content-btn');
    contentMore.classList.add('main_contents_content-more');
    // メッセージの要素に内容を入れる
    contentName.textContent = msg.msg.name + 'さん';
    contentDate.textContent = msg.time;
    contentBtn.textContent = 'すべて見る';
    // メッセージの要素をcontentに追加してグループ化する
    content.appendChild(contentName);
    content.appendChild(contentDate);
    content.appendChild(document.createElement('br'));

    // <br>の数をカウント
    let countBr = msg.msg.value.split(/\n/).length - 1;
    // <br>が３つを超える、4つ以上の時
    if(countBr > 3) {
        let i = 1;
        let msgReplace = msg.msg.value;
        // メッセージを4つに分割するため<br>の３つの場所に印（""）を入れるため
        while (i != 4) {
            msgReplace = msgReplace.replace(/\n/,'""');
            i++;
        }
        // 印（""）を入れた所をSplit関数で区切る
        let msgSplit = msgReplace.split('""');
        let msgbefore = msgSplit[0] + '\n' + msgSplit[1] + '\n' + msgSplit[2];
        let msgafter = msgSplit[3];
        contentMessage.innerText = msgbefore;
        contentMore.innerText = msgafter;
        content.appendChild(contentMessage);
        content.appendChild(contentBtn);
        content.appendChild(contentMore);
        $contents.appendChild(content);
    } else {
        // <br>が３つ以下の時
        contentMessage.innerText = msg.msg.value;
        content.appendChild(contentMessage);
        $contents.appendChild(content);
    }
    // morebtnのクリックイベント
    let $moreBtns = document.querySelectorAll('.main_contents_content-btn');
    for (let index = 0; index < $moreBtns.length; index++) {
        const element = $moreBtns[index];
        element.addEventListener('click', () => {
            let $more = document.querySelectorAll('.main_contents_content-more');
            element.classList.add('hide');
            $more[index].classList.add('show');
        });
    }
});


// フォーカス
window.onload = () => {
    $formMessage.focus();
    socket.emit('Done', {name: $name});
}


// masterメッセージの要素作成関数
const masterMsg = (name,time,flag) => {
    let content = document.createElement('div'); 
    let contentName = document.createElement('span');
    let contentDate = document.createElement('span');
    let contentMessage = document.createElement('p');
    content.classList.add('main_contents_content');
    if(flag == 1) {
        // 入室の場合
        content.classList.add('in');
    } else {
        // 退室の場合
        content.classList.add('out');
    }
    content.classList.add('master');
    contentName.classList.add('main_contents_content-name');
    contentDate.classList.add('main_contents_content-date');
    contentMessage.classList.add('main_contents_content-msg');
    contentName.textContent = '管理人';
    contentDate.textContent = time;
    // 子要素に入れる
    content.appendChild(contentName);
    content.appendChild(contentDate);
    content.appendChild(document.createElement('br'));
    if(flag == 1) {
        contentMessage.innerText = `${name}さんが入室しました。`;
    } else {
        contentMessage.innerText = `${name}さんが退室しました。`;
    }
    content.appendChild(contentMessage);
    $contents.appendChild(content);
}
