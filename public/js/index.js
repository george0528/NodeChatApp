const $form = document.querySelector('.main_form');
const $name = document.querySelector('.main_form-name');
const $btn = document.querySelector('.main_form-btn');
const $warning = document.querySelector('.main_form-warning');
// ボタンのクリックイベント
$btn.addEventListener('click', (e) => {
    e.preventDefault();
    let value = $name.value;
    // 文字数チェック
    if(value.length < 15) {
        // 空白チェック関数
        const flag = spaceCheck(value);
        if(flag) {
            btnSubmit();
        } else {
            $warning.style.display = 'block';
            $name.value = '';
        }
    } else {
        $name.value = '';
        window.alert('15文字超えるなっつたろ！優しく言ってるうちにいうこと聞けや');
    }
});

// 空白チェック
const spaceCheck = (value) => {
    const NGs = [' ','　'];
    const delete1 = value.split(NGs[0]).join('');
    const delete2 = delete1.split(NGs[1]).join('');
    if(delete2 == '') {
        // 空だったらfalseを返す
        return false;
    } else {
        // 空じゃなかったらtrueを返す
        return true;
    }
}

// ボタンのクリックsubmit関数
const btnSubmit = () => {
    document.form.submit();
}

// フォーカス
window.onload = () => {
    $name.focus();
}

