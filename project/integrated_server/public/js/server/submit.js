function save() {
    var form1 = document.getElementById("form1");

    var name = form1.name.value;
    var address = form1.address.value;
    var ip = form1.ip.value;
    var base_port = form1.base_port.value;
    var push_port = form1.push_port.value;
    var cmd_port = form1.cmd_port.value;
    var udp_port = form1.udp_port.value;
    var web_port = form1.web_port.value;
    var gcm_senderid = form1.gcm_senderid.value;

    var Province = $("#Province option:selected").val();
    var City = $("#City option:selected").val();
    var weather_location_seq = $("#Town option:selected").val();



    if (name == "") {
        alert("서버명을 입력하세요.");
        return;
    }

    if (address == "") {
        alert("주소를 입력하세요.");
        return;
    }

    if (ip == "") {
        alert("IP를 입력하세요.");
        return;
    }
    if (!ValidateIPaddress(ip)) {
        alert("IP 형식을 제대로 입력하세요.");
        return;
    }

    if (base_port == "") {
        alert("base_port 를 입력하세요.");
        return;
    }
    if (!isNumber(base_port)) {
        alert("base_port 를 숫자로 입력하세요");
        return;
    }

    if (push_port == "") {
        alert("push_port 를 입력하세요.");
        return;
    }
    if (!isNumber(push_port)) {
        alert("push_port 를 숫자로 입력하세요");
        return;
    }


    if (cmd_port == "") {
        alert("cmd_port 를 입력하세요.");
        return;
    }
    if (!isNumber(cmd_port)) {
        alert("cmd_port 를 숫자로 입력하세요");
        return;
    }

    if (udp_port == "") {
        alert("udp_port 를 입력하세요.");
        return;
    }
    if (!isNumber(udp_port)) {
        alert("udp_port 를 숫자로 입력하세요");
        return;
    }

    if (web_port == "") {
        alert("web_port 를 입력하세요.");
        return;
    }
    if (!isNumber(web_port)) {
        alert("web_port 를 숫자로 입력하세요");
        return;
    }


    if (gcm_senderid == "") {
        alert("gcm_senderid 를 입력하세요.");
        return;
    }

    if (Province == "") {
        alert("시,도 를 선택하세요.");
        return;
    }


    if (City == "") {
        alert("구,군을 선택하세요.");
        return;
    }


    if (weather_location_seq == "") {
        alert("읍면동을 선택하세요.");
        return;
    }

    form1.weather_location_seq.value = weather_location_seq;


    form1.submit();
}