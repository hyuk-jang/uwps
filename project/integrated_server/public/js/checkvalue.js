
function checkPhoneNum(str) {
  //앞에는 3개의 숫자 
  //중간은 3개도 되고 4개도 된다.
  //끝은 무조건 4자이다.
  //모든 숫자체크하고.
  //해당 내용이 아니면 false
  //맞으면 true
  //010-817-1111


  var str;
  var check;

  var filter = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
  if (filter.test(str) == true) {
    check = true;
  } else {
    check = false;
  }

  return check;
}