function save() {
    var form1 = document.getElementById("form1");

    var name = form1.name.value;
    var address = form1.address.value;
    var password = form1.password.value;
    var passwordCheck = form1.passwordCheck.value;
    var tel = form1.tel.value;
    var saltern_info_seq = form1.saltern_info_seq.value;

    if (name == "") {
        alert("성명을 입력하세요.");
        return;
    }
    if (checkStringFormat(name) == true) {
        alert("성명 형식이 올바르지 않습니다.");
        return;
    }


    if (address == "") {
        alert("주소를 입력하세요.");
        return;
    }
    //if (checkStringFormat(address) == true) {
    //    alert("주소 형식이 올바르지 않습니다.");
    //    return;
    //}


    if (password != passwordCheck) {
        alert("비밀번호와 비밀번호 확인이 다릅니다.");
        return;
    }
    if (tel == "") {
        alert("연락처를 입력하세요.");
        return;
    }

    if (!checkPhoneNum(tel)) {
        alert("연락처 형식이 맞지 않습니다.");
        return;
    }

    if (saltern_info_seq == "") {
        form1.saltern_info_seq.value = "0";
    }
    form1.submit();
}