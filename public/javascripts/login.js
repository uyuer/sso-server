window.onload = async function () {
    // 在sso-mine服务中校验是否登录
    let doLogin = function () {
        // let token = window.localStorage.getItem('token');
        // if (token) {
        //     return;
        // }
        return new Promise(function (resolve, reject) {
            var xhr;
            if (window.XMLHttpRequest) {
                //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
                xhr = new XMLHttpRequest();
            }
            else {
                // IE6, IE5 浏览器执行代码
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log(xhr)
                    console.log(JSON.parse(xhr.responseText));
                    let data = JSON.parse(xhr.responseText);
                    resolve(data.data)
                }
                if (xhr.status == 401) {
                    debugger
                    console.log('未登录重定向了', `http://sso.uyue.club:8000/login?serviceURL=${location.href}`)
                    // location.href = `http://sso.uyue.club:8000/login?serviceURL=${location.href}`
                }
            }
            xhr.open("GET", "/api/user/doLogin", false); // 同步
            xhr.send();
        })
    }
    let responseData = await doLogin();
    if (responseData) {
        // let { token, user } = responseData || {};
        console.log(responseData)
        // localStorage.setItem('token', JSON.stringify(token))
        // localStorage.setItem('user', JSON.stringify(user))
    }


    let logoutBtn = document.getElementById('logout');
    logoutBtn.onclick = async () => {
        let result = new Promise(resolve => {
            var xhr;
            if (window.XMLHttpRequest) {
                //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
                xhr = new XMLHttpRequest();
            }
            else {
                // IE6, IE5 浏览器执行代码
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log(xhr, xhr.responseText, JSON.parse(xhr.responseText))
                    let data = JSON.parse(xhr.responseText);
                    resolve(data.data)
                }
            }
            xhr.open("GET", "/api/user/logout", true); // 同步
            xhr.send();
        })
        let res = await result;
        console.log('退出', `http://sso.uyue.club:8000/login?serviceURL=${location.href}`)
        debugger
        return;
        // location.href = `http://sso.uyue.club:8000/login?serviceURL=${location.href}`
    }

    let findOneBtn = document.getElementById('findOne');
    findOneBtn.onclick = () => {
        let result = new Promise(resolve => {
            var xhr;
            if (window.XMLHttpRequest) {
                //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
                xhr = new XMLHttpRequest();
            }
            else {
                // IE6, IE5 浏览器执行代码
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log(xhr, xhr.responseText, JSON.parse(xhr.responseText))
                    let data = JSON.parse(xhr.responseText);
                    resolve(data.data)
                }
            }
            xhr.open("POST", "/api/play/findOne", true); // 同步
            xhr.send();
        })
    }
}