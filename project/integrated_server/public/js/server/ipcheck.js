function IP_CHECK(Data) {
    $('#check_text').empty();
    $.ajax({
        type: "GET",
        url: "/admin/ajax/ip-overlap/" + Data
    }).done(function (data, msg, res) {
        if (res.status === 204) {
            $('#check_text').append("IP를 사용 가능합니다.").css("color", "blue");
        } else {
            $('#check_text').append("IP가 중복 되었습니다.").css("color", "red");
        }
    }).fail(function (req, sts, err) {
        alert(err);
    });
}