
//배열을 순회하면서 프로퍼티 이름과 벨류와 같은 내용을 하나 찾기
Array.prototype.findArrayElement = function (key, value) {
    var returnvalue = null;

    this.some(function (obj) {
        if (obj[key] == value) {
            returnvalue = obj;
            return true;
        }
    })

    return returnvalue;
}
// 배열의 프로퍼티 이름이 ID이고 입력한 ID 값이 같은거 하나 찿기
Array.prototype.findArrayElementById = function (value) {
    return this.findArrayElement("ID", value);
}


// 배열의 프로퍼티 이름이 Number이고 입력한 Number 값이 같은거 하나 찿기
Array.prototype.findArrayElementByNumber = function (value) {
    return this.findArrayElement("Number", value);
}


// 다수개 찾기
Array.prototype.findArrayElements = function (key, value) {
    var returnvalue = [];

    this.forEach(function (obj) {
        if (obj[key] == value) {
            returnvalue.push(obj);
        }
    })

    return returnvalue;
}

Array.prototype.findArrayElementsByBoardid = function (value) {
    return this.findArrayElements("BoardID", value);
}

//배열의 요소를 인덱스로 삭제
Array.prototype.deleteByIndex = function (index) {
    this.splice(index, 1);
}
