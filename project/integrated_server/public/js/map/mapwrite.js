



//브라우져 크기에 따른 화면크기 지정
$(document).ready(function(){
    $('#jsonText').css('width', $(window).width() - 450 );
    $('#jsonText').css('height', $(window).height() - 280 );
    $(window).resize(function() {
        $('#jsonText').css('width', $(window).width() - 450 );
        $('#jsonText').css('height', $(window).height() - 280 );
    });

    //텍스트수정 및 맵수정 버튼 클릭시 css
    $('#btnText').addClass('selectedButton');
    $('#btnText').click(function () {
        $('#btnText').addClass('selectedButton');
        $('#btnMap').removeClass('selectedButton');
    });
    $('#btnMap').click(function () {
        $('#btnMap').addClass('selectedButton');
        $('#btnText').removeClass('selectedButton');
    });
});
//텍스트수정 버튼 화면 리사이즈
function resizeText() {
    console.log("시작", mapWidth);
    $('.header').css('width', $(window).width() - 450);
    $('.content').css('width', $(window).width() - 450);
    $('.content').css('height', $(window).height() - 280);
}

//맵수정 버튼 화면 리사이즈
function resizeFull() {
    console.log("시작", mapWidth);
    $('.header').css('width', mapWidth);
    $('.content').css('width', mapWidth);
    $('.content').css('height', mapHeight);
}


// 염전 맵 수정 submit
function updateResource() {

    var map_Data = $("#jsonText").val();

    try {
        JSON.parse($("#jsonText").val());
    } catch (error) {
        return alert("입력된 형식이 JSON이 아닙니다.");
    }

    if (!confirm("해당 내용으로 입력 하시겠습니까?")) {
        return;
    }

    form1.submit();
}

// Text, Map 변경
function changeEditor(type) {
    var textMode = type === "text" ? "block" : "none";
    var mapMode = type === "map" ? "block" : "none";

    $("#textEdit").css("display", textMode);
    $("#mapEdit").css("display", mapMode);
}
