/*****************************************************************************************************************/
//*************                                    Date 관련                                         *************
/*****************************************************************************************************************/

// (Date) Date To yyyy-MM-ss HH:mm:ss /// <returns type="String" />


function convertDateToText(dateTime, language, endIndex, startIndex) {
  var returnvalue = "",
    // arg 재정의
    //dateTime = dateTime,
    language = language === undefined || language == "" ? "char" : language,
    endIndex = endIndex === undefined || endIndex == "" ? 5 : endIndex,
    startIndex = startIndex === undefined || startIndex == "" ? 0 : startIndex,
    timeTable = [], // date 타임 year ~ sec 순서대로 push
    strTimeTable = [], // 적정 str로 교체
    separates = ""; // 첨가물


  timeTable.push(dateTime.getFullYear());
  timeTable.push(dateTime.getMonth() + 1);
  timeTable.push(dateTime.getDate());
  timeTable.push(dateTime.getHours());
  timeTable.push(dateTime.getMinutes());
  timeTable.push(dateTime.getSeconds());

  timeTable.forEach(function (time) {
    String(time).length == 1 ? strTimeTable.push("0" + String(time)) : strTimeTable.push(String(time));
  })

  var separates = "";
  switch (language) {
    case "char":
      separates = ["", "-", "-", " ", ":", ":"];
      break;
    default:
      separates = ["년", "월", "일", "시", "분", "초"];
      break;
  }

  strTimeTable.forEach(function (timeData, index) {
    if (index < startIndex || index > endIndex) return;

    if (language == "char")
      returnvalue += separates[index] + timeData;
    else {
      returnvalue = returnvalue.length > 0 ? returnvalue.concat(" ") : "";
      returnvalue += timeData + separates[index];
    }
  });
  return returnvalue;
}
exports.convertDateToText = convertDateToText;

/**
 * @description text 형식의 날짜를 Date Obj 반환
 * @param {String} textDate 
 * @return {Date} description
 */
// (String Date) yyyy-MM-ss HH:mm:ss To Date Object  /// <returns type="Date" />
function convertTextToDate(textDate) {
  var strYYYYMMDD = textDate.split(" ")[0],
    strHHMMSS = textDate.split(" ")[1],
    year = Number(strYYYYMMDD.split("-")[0]),
    month = Number(strYYYYMMDD.split("-")[1]) - 1,
    day = Number(strYYYYMMDD.split("-")[2]),
    hour = Number(strHHMMSS.split(":")[0]),
    min = Number(strHHMMSS.split(":")[1]),
    sec = Number(strHHMMSS.split(":")[2]);

  return new Date(year, month, day, hour, min, sec, 0);
}
exports.convertTextToDate = convertTextToDate;

/* IE8 이하 버전 전용. 이후버전 var time = new Date('2010-01-13T18:31:16Z').toLocaleString(); 형식 사용 */
// (String 8601 Date) To yyyy-MM-ss HH:mm:ss (textDate = ex-> "2017-01-08T17:16:36.000Z")  /// <returns type="Date" />
function convert8601TextToDate(textDate) {
  if (!textDate || +textDate !== 1307000069000) {
    var day, tz,
      rx = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/;
    p = rx.exec(textDate) || [];
    if (p[1]) {
      day = p[1].split(/\D/);
      for (var i = 0, L = day.length; i < L; i++) {
        day[i] = parseInt(day[i], 10) || 0;
      };
      day[1] -= 1;
      day = new Date(Date.UTC.apply(Date, day));
      if (!day.getDate()) return NaN;
      if (p[5]) {
        tz = (parseInt(p[5], 10) * 60);
        if (p[6]) tz += parseInt(p[6], 10);
        if (p[4] == '+') tz *= -1;
        if (tz) day.setUTCMinutes(day.getUTCMinutes() + tz);
      }
      return day;
    }
    return NaN;
  } else {
    return new Date(textDate);
    //native ISO Date implemented;
  }
}
exports.convert8601TextToDate = convert8601TextToDate;

// yyyy-mm-dd, yyyy-mmdd, yyyymmdd, yyyymm-dd To yyyy-mm-dd  /// <returns type="String" /> 
function convertDateFormat(textDate) {
  try {
    var frontDate = textDate.split(" ").length === 2 ? textDate.split(" ")[0] : textDate,
      rearDate = textDate.split(" ").length === 2 ? textDate.split(" ")[1] : "",
      year = 0,
      month = 0,
      day = 0,
      hour = rearDate.split(":")[0] === undefined ? 0 : Number(rearDate.split(":")[0]),
      min = rearDate.split(":")[1] === undefined ? 0 : Number(rearDate.split(":")[1]),
      sec = rearDate.split(":")[2] === undefined ? 0 : Number(rearDate.split(":")[2]);
    maxDay = 0;

    frontDate = frontDate.replace(/-/g, "");
    // 자리수가 맞지않을때
    if (isNaN(frontDate) || frontDate.length != 8) {
      return "";
    }

    year = Number(frontDate.substring(0, 4));
    month = Number(frontDate.substring(4, 6));
    day = Number(frontDate.substring(6, 8));
    maxDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

    if (month < 1 || month > 12) return "";

    if (month == 2 && (year % 4 == 0 && year % 100 != 0 || year % 400 == 0)) // 윤년 체크
      maxDay = 29;

    if (day <= 0 || day > maxDay) return "";
    if (hour < 0 || hour >= 24) return "";
    if (min < 0 || min >= 60) return "";
    if (sec < 0 || sec >= 60) return "";

    return convertDateToText(new Date(year, month, day, hour, min, sec, 0));

  } catch (err) {
    return "";
  }
}
exports.convertDateFormat = convertDateFormat;

// 두 날짜 사이의 간격 비교 /// <returns type="Object" /> 
function calcDateInterval(baseDate, nextDate) {
  var firstDate = convertTextToDate(baseDate),
    secondDate = convertTextToDate(nextDate),
    storage = parseInt(firstDate - secondDate) / 1000,

    returnvalue = {
      remainDay: 0,
      remainHour: 0,
      remainMin: 0,
      remainSec: 0
    }

  returnvalue.remainDay = parseInt(storage / 60 / 60 / 24);
  storage -= returnvalue.remainDay * 60 * 60 * 24;
  returnvalue.remainHour = parseInt(storage / 60 / 60);
  storage -= returnvalue.remainHour * 60 * 60;
  returnvalue.remainMin = parseInt(storage / 60);
  returnvalue.remainSec = parseInt(storage - (returnvalue.remainMin * 60));

  return returnvalue;
}
exports.calcDateInterval = calcDateInterval;


function splitStrDate(strDate) {
  // console.log(typeof strDate )
  strDate = typeof strDate !== "string" ? strDate.toString() : strDate;
  // console.log("strDate : " + strDate);
  var years = strDate.substring(0, 4);
  var month = strDate.substring(4, 6);
  var day = strDate.substring(6, 8);
  var hours = strDate.substring(8, 10);
  var min = strDate.substring(10, 12);

  return new Date(years, month - 1, day, hours, min, 0);
}
exports.splitStrDate = splitStrDate;




/*****************************************************************************************************************/
//*************                                    Debuging 관련                                     *************
/*****************************************************************************************************************/

// console.log 개발자 버젼
function log() {
  var traceObj = traceOccurPosition(this),
    occurInfo = "   --> " + traceObj.fileName + " : " + traceObj.lineNumber;

  for (let arg of arguments) {
    process.stdout.write(String(arg));
  }
  console.log(occurInfo);
}
exports.log = log;

// Console.Log by Option
function CLIN(pOjbect, num) {
  var util = require("util");
  console.log(util.inspect(pOjbect, true, num));
}
exports.CLIN = CLIN;

// Console.Log InspectS
function CLIS() {
  var util = require("util");
  var traceObj = traceOccurPosition(this),
    occurInfo = "   " + traceObj.fileName + " : " + traceObj.lineNumber;
  console.log("-------------   ", occurInfo, convertDateToText(new Date(), "char", 5, 1));

  for (let argNum = 0; argNum < arguments.length; argNum += 1) {
    console.log("pOjbect" + (argNum + 1), " --> ", util.inspect(arguments[argNum], true, 10));
  }

  console.log("=============  CLIS END  ============= ", traceObj.fileName + " : " + traceObj.lineNumber);
}
exports.CLIS = CLIS;

// Console.Log Inspect
function CLI() {
  var util = require("util");
  var traceObj = traceOccurPosition(this),
    occurInfo = "   " + traceObj.fileName + " : " + traceObj.lineNumber + " ( " + traceObj.functionName + " )";
  console.log("-------------   ", occurInfo, convertDateToText(new Date(), "char", 5, 1));

  for (let argNum = 0, argLength = arguments.length - 1; argNum <= argLength; argNum += 1) {
    if (argNum % 2 === 0) {
      argNum === argLength ? console.log(util.inspect(arguments[argNum], true, 10)) : process.stdout.write(String(arguments[argNum]));
    } else {
      console.log(" --> ", util.inspect(arguments[argNum], true, 10));
    }
  }

  console.log("=============  CLI END  =============  ", traceObj.fileName + " : " + traceObj.lineNumber);
}
exports.CLI = CLI;

// 호출 위치(this)의 파일명, 라인번호, func /// <returns type="Object" />
function traceOccurPosition(target) {
  var returnObj = {};

  __stack.forEach(function (stack, index) {
    if (index == 2) {
      returnObj.functionName = stack.getFunctionName();
      returnObj.lineNumber = "@@@ " + stack.getLineNumber() + " @@@";
      returnObj.fileName = stack.getFileName();

      var splitFileName = returnObj.fileName.split("\\");

      var index = splitFileName.length - 1;
      var fileName = splitFileName[index - 2] + "/" + splitFileName[index - 1] + "/" + splitFileName[index];
      returnObj.fileName = fileName;
    }
    //log(stack.getFunctionName());
    //log(stack.getLineNumber())
    //log(stack.getFileName())
  });
  return returnObj;
}
exports.traceOccurPosition = traceOccurPosition;


// 호출된 위치에서 상위 call Function List 출력. maxCounter Level 이상이 되면 출력하지 않음
function debugConsole(maxCounter) {
  maxCounter = maxCounter == null || maxCounter === "" ? 4 : maxCounter;
  console.log("@@@@@@@@@@   debugConsole Start    @@@@@@@@@@");

  __stack.forEach(function (stack, index) {
    var sourceName = "";
    if (maxCounter < index || index == 0) {
      return;
    }
    // CLI(stack)
    sourceName = stack.getFileName().substr(stack.getFileName().lastIndexOf("/"));
    console.log("--S", sourceName, "--L", stack.getLineNumber(), "--F", stack.getFunctionName())
  });

  console.log("@@@@@@@@@@   debugConsole End      @@@@@@@@@@");
}
exports.debugConsole = debugConsole;






/*****************************************************************************************************************/
//*************                                     File 관련                                        *************
/*****************************************************************************************************************/

// 파일 읽기    /// <returns type="callback(Boolean, String)" />
function readFile(path, encoding, callback) {
  var fs = require("fs");
  encoding = encoding == null || encoding === "" ? "utf8" : encoding;
  try {
    fs.readFile(path, encoding, function (err, data) {
      console.log('@@@')
      if (err) return callback(err);
      console.log('@@@')
      if (callback != null) return callback(err, data);
    });
  } catch (e) {
    console.log('##')
    if (callback != null) callback(e);
    console.log('##')
  }
}
exports.readFile = readFile;
// 파일 쓰기    /// <returns type="callback(Boolean)" />
// 파일 열고 쓰고 닫기 /// <returns type="callback(Boolean, String, Buffer" />
// Option
//'r' - 읽기로 열기. 파일이 존재하지 않으면 에러발생.
//'r+' - 읽기/쓰기로 열기. 파일이 존재하지 않으면 에러발생.
//'w' - 쓰기로 열기. 파일이 존재하지 않으면 만들어지고, 파일이 존재하면 지우고 처음부터 씀.
//'w+' - 읽기/쓰기로 열기. 파일이 존재하지 않으면 만들어지고, 파일이 존재하면 처음부터 씀.
//'a' - 추가 쓰기로 열기. 파일이 존재하지 않으면 만들어짐.
//'a+' - 파일을 읽고/추가쓰기모드로 열기. 파일이 존재하지 않으면 만들어짐.
//options <Object> | <String>
//encoding <String> | <Null> default = 'utf8'
//mode <Integer> default = 0o666
//flag <String> default = 'w'
function writeFile(path, message, option, callback) {
  var fs = require("fs");
  option = option === "" || option == null ? "a" : option; // 기본 옵션 '이어 쓰기'
  try {
    // console.log("message",typeof message)
    message = typeof message === "object" ? JSON.stringify(message) : message;
    // CLI(message);
    fs.writeFile(path, message, {
      flag: option
    }, (err) => {
      if (err) {
        if (err.errno === -4058) {
          let targetDir = err.path.substr(0, err.path.lastIndexOf('\\'));
          makeDirectory(targetDir, () => {
            console.error(err)
            return writeFile(path, message, option, callback);
          });
        }
      }
      if (callback != null) callback(err);
    })
  } catch (e) {
    if (callback != null) callback(e);
  }
}
exports.writeFile = writeFile;

// 디렉토리 읽기
function searchDirectory(path, callback) {
  var fs = require("fs");
  try {
    var returnvalue = [];
    fs.readdir(path, function (err, files) {
      if (err) return callback(err);
      if (callback != null) return callback(err, files);
      console.log("여긴 안오지")
      files.forEach(function (file) {
        returnvalue.push(file);
        console.log(path + file);
        fs.stat(path + file, function (err, stats) {
          console.log(stats);
        });
      });
      callback(null, returnvalue);
    });
  } catch (e) {
    if (callback != null) callback(e);
  }
}
exports.searchDirectory = searchDirectory;
// 디렉토리 생성
function makeDirectory(path, callback) {
  var fs = require("fs");
  try {
    fs.mkdir(path, function (err) {
      if (err) console.error(err)
      if (callback != null) callback(err);
      console.log('Created newdir');
    });
  } catch (e) {
    if (callback != null) callback(e);
  }
}
exports.makeDirectory = makeDirectory;
// 디렉토리 삭제
function deleteDirectory(path, callback) {
  var fs = require("fs");
  try {
    fs.rmdir(path, function (err) {
      if (err) console.error(err)
      if (callback != null) callback(err);
      console.log('Removed newdir');
    });
  } catch (e) {
    if (callback != null) callback(e);
  }
}
exports.deleteDirectory = deleteDirectory;


// 기본 File Function 사용한 버전

// 파일 이어쓰기
function appendFile(path, message) {
  var convertMessage = "\r\n\r\n" + convertDateToText(new Date()) + "\r\n" + message + "\r\n";
  writeFile(path, convertMessage, "a");
}
exports.appendFile = appendFile;

//로그파일에 기록
function logFile(message) {
  // CLI(message);
  var path = process.cwd() + "/log/log.txt";
  var convertMessage = "\r\n\r\n" + convertDateToText(new Date()) + "\r\n" + message + "\r\n";
  writeFile(path, convertMessage, "a");
}
exports.logFile = logFile;

// Error Log
function errorLog(errType, msg, exceptionError) {
  var errFullPath = process.cwd() + "\\log\\" + errType + ".txt",
    errInfo = "",
    message = "";
  // uncaughtException 예외 발생이 아닐 경우. function 추적 가능
  if (exceptionError == null) {
    var traceObj = traceOccurPosition(this);
    errInfo = "\t" + traceObj.fileName + " : " + traceObj.lineNumber + " : " + traceObj.functionName;
  } else { // uncaughtException 발생할 경우 exception 에서 추적
    errInfo = exceptionError.stack.split(/\n/g)[1];
  }

  message = "Info" + " : " + convertDateToText(new Date(), "char") + "\r\n";
  message += errInfo;
  message += "\r\n\t" + "err Message" + " : " + msg + "\r\n\r\n";

  writeFile(errFullPath, message, "a");
}
exports.errorLog = errorLog;


/*****************************************************************************************************************/
//*************                                     Dom 관련                                         *************
/*****************************************************************************************************************/

// Page Nation Dom 생성
function makePagination({
  page,
  pathName,
  querystring,
  pageCount,
  totalCount
}) {
  var _ = require("underscore");
  var returnvalue = "",
    _paginationMaxCount = 10,
    firstpage = ((parseInt((page - 1) / _paginationMaxCount))) * _paginationMaxCount + 1,
    finalpage = parseInt(((totalCount - 1) / pageCount + 1)),
    // endpage = (firstpage + _paginationMaxCount - 1) > finalpage ? finalpage : firstpage + _paginationMaxCount - 1;
    endpage = firstpage + _paginationMaxCount - 1;

  if (endpage > finalpage) {
    endpage = finalpage;
  }


  if (firstpage > 1) {
    var template = _.template('<a href="<%= pathName %>?page=<%= firstpage-1 %>&<%= querystring %>"><img src="/images/icon3.jpg" width="17px" height="17px" alt="이전" title="이전" /></a>');
    returnvalue += template({
      "pathName": pathName,
      "firstpage": firstpage,
      "querystring": querystring
    });
  } else {
    returnvalue += '<a><img src="/images/icon.jpg" width="17px" height="17px"  alt="이전" /></a>';
  }

  for (var i = firstpage; i <= endpage; i++) {
    if (i == page) {
      returnvalue += "<strong><span>" + i + "</span></strong>";
    } else {
      returnvalue += "<a href='" + pathName + "?page=" + i + "&" + querystring + "'><span>" + i + "</span></a>";
    }
  }


  if (endpage < finalpage) {
    var template = _.template('<a href="<%= pathName %>?page=<%= endpage + 1 %>&<%= querystring %>"><img src="/images/icon4.jpg" width="17px" height="17px"  alt="다음" /></a>');
    returnvalue += template({
      "pathName": pathName,
      "endpage": endpage,
      "querystring": querystring
    });
  } else {
    returnvalue += '<a><img class="page_lst" src="/images/icon2.jpg" width="17px" height="17px" alt="다음" /></a>';

  }

  return returnvalue;

}
exports.makePagination = makePagination;

function pageNation(page, totalCount, listCount, url, pageField) {

  var returnvalue = "";

  var _page = parseInt(page);
  var _totalCount = parseInt(totalCount);
  var _listCount = parseInt(listCount);
  var _url = url;
  var _pageField = pageField;
  var _paginationMaxCount = 10;

  returnvalue += '<div id="pagenation">';

  var firstpage = ((parseInt((_page - 1) / _paginationMaxCount))) * _paginationMaxCount + 1;
  var endpage = firstpage + _paginationMaxCount - 1;
  var finalpage = ((_totalCount - 1) / _listCount + 1);

  if (endpage > finalpage)
    endpage = finalpage;

  log("pageNation");



  if (firstpage > 1) {
    returnvalue += '<a href="' + _url + '?page=' + (firstpage - 1) + '&' + _pageField + '"><img src="/images/pn_prev.gif" alt="이전" title="이전" /></a>';
  } else {
    returnvalue += '<a><img src="/images/pn_prev_off.gif" alt="이전" /></a>';
  }

  for (var i = firstpage; i <= endpage; i++) {
    if (i == _page)
      returnvalue += "<strong><span>" + i + "</span></strong>";
    else
      returnvalue += "<a href='" + _url + "?page=" + i + "&" + _pageField + "'><span>" + i + "</span></a>";
  }

  if (endpage < finalpage) {
    returnvalue += '<a href="' + _url + '?page=' + (endpage + 1) + '&' + _pageField + '"><img src="/images/pn_next.gif" alt="다음" /></a>';
  } else {
    returnvalue += '<a><img class="page_lst" src="/images/pn_next_off.gif" alt="다음" /></a>';
  }
  returnvalue += '</div>';

  return returnvalue;


}
exports.pageNation = pageNation;


function getSelected(pvalue, basevalue) {

  if (pvalue == undefined)
    pvalue = "";
  if (basevalue == undefined)
    basevalue = "";

  if (pvalue == null)
    pvalue = "";
  if (basevalue == null)
    basevalue = "";

  var returnvalue = "";

  if (pvalue.toString() == basevalue.toString()) {
    returnvalue = ' selected="selected" ';
  }
  return returnvalue;
}
exports.getSelected = getSelected;





/*****************************************************************************************************************/
//*************                                 Common Util 관련                                     *************
/*****************************************************************************************************************/

// One Single Quotation --> Two Single Quotation    /// <returns type="String" />
function MRF(value) {
  var str_value = value.toString();
  return str_value.split("'").join("''");
}
exports.MRF = MRF;

// Remove Byte Order Mark. /// <returns type="String" />
function removeBOM(str, encoding) {
  var returnvalue = "";
  encoding = encoding == null || encoding == "" ? "UTF-16BE" : encoding;

  switch (encoding) {
    case "UTF-8":
      str.replace(/^\uEFBBBF/, '');
      break;
    case "UTF-16BE":
      str.replace(/^\uFEFF/, '');
      break;
    case "UTF-16LE":
      str.replace(/^\uFFFE/, '');
      break;
    case "UTF-32BE":
      str.replace(/^\u0000FEFF/, '');
      break;
    case "UTF-32LE":
      str.replace(/^\uFFFE0000/, '');
      break;
    case "SCSU":
      str.replace(/^\u0EFEFF/, '');
      break;
    case "UTF-EBCDIC":
      str.replace(/^\uDD736673/, '');
      break;
    case "BOCU-1":
      str.replace(/^\uFBEE28/, '');
      break;
    default:
      break;
  }

  return returnvalue;
}
exports.removeBOM = removeBOM;

// TransPosition(이항 연산자 Func)   /// <returns type="String" />
function transPosition(value, trueValue, falseValue) {
  value = value == null ? "" : value;
  if (typeof value === "number")
    trueValue = trueValue == null || trueValue == "" ? 0 : trueValue;
  else
    trueValue = trueValue == null || trueValue == "" ? "" : trueValue;

  falseValue = falseValue == null || falseValue == "" ? value : falseValue;

  if (typeof value == "boolean")
    return value ? trueValue : falseValue;

  return (value == trueValue) || value === "" ? trueValue : falseValue;
}
exports.transPosition = transPosition;
// true: !0, str, true    false: [], {}, null, undefined, false, 0, ""


// 문자열 자동 채움    /// <returns type="String" />
/* option(start:앞부분, end:뒷부분) */
function autoFillString(str, char, length, option) {
  str = str == null ? "" : str;
  char = char == null ? "" : char;
  length = length ? length : str.length;

  var repeatCount = length - str.length;
  var inputChar = "";
  while (repeatCount) {
    inputChar = inputChar.concat(char);
    repeatCount--;
  }

  return transPosition(option, "start", "end") === "start" ? inputChar.concat(str) : str.concat(inputChar);
}
exports.autoFillString = autoFillString;



// ReplaceAll   /// <returns type="String" />
function replaceAll(sValue, param1, param2) {
  return sValue.split(param1).join(param2);
}
exports.replaceAll = replaceAll;



// [], {}, "", undefined, null To true  /// <returns type="Boolean" />
function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
}
exports.isEmpty = isEmpty;

// Email Reg Check /// <returns type="Boolean" />
function isEmail(str_value) {
  var reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
  if (!reg_email.test(str_value)) {
    return false;
  } else {
    return true;
  }

}
exports.isEmail = isEmail;

// Check 정수형    /// <returns type="Boolean" />
function checkIntStr(n) {
  return n >>> 0 === parseFloat(n);
}
exports.checkIntStr = checkIntStr;



// 정해진 배열 크기만큼 유지하면서 Queue 구조로 처리함  /// <returns type="Array" />
function getArrBoundary(prevArr, newData, arrLength) {
  var returnvalue = [];

  newData = Array.isArray(newData) ? newData : [newData];
  arrLength = arrLength == null || arrLength == "" ? 1 : arrLength;

  returnvalue = prevArr.concat(newData);

  if (returnvalue.length > arrLength) {
    var spliceIndex = returnvalue.length - arrLength;
    returnvalue.splice(0, spliceIndex);
  }
  return returnvalue;
}
exports.getArrBoundary = getArrBoundary;



//순수 숫자로 구성된 JSON인가
function checkJSONArrNumber(arrData) {
  var _ = require("underscore");
  var returnvalue = true;
  if (!_.isArray(arrData) || _.isEmpty(arrData)) {
    return false;
  }
  _.each(arrData, function (data) {
    if (!_.isNumber(data)) {
      returnvalue = false;
    }
  });
  return returnvalue;
}
exports.checkJSONArrNumber = checkJSONArrNumber;



/*****************************************************************************************************************/
//*************                                 Search or Find 관련                                  *************
/*****************************************************************************************************************/



// Array, Object 리스트를 순회하면서 Property가 동일한 Parents 반환
function findObjListByKeyAndValue(returnArray, object, key, value, isFindArray) {
  isFindArray = isFindArray == "1" ? "1" : "0";
  // 자료형이 배열(Object 포함)이 아닐 경우 종료
  if (!object instanceof Array)
    return;
  // 현재 부모의 Key값 순회
  for (var variable in object) {
    var propertyValue = object[variable];
    if (typeof propertyValue === "function") {
      continue;
    }

    if (propertyValue instanceof Array) {
      // Key값이 매칭되고 배열안에 value가 존재할 경우
      if (key === variable && propertyValue.indexOf(value) !== -1) {
        if (isFindArray === "0")
          continue;
        else if (isFindArray === "1") {
          returnArray.push(object);
          continue;
        }
      }
    } else if (variable === key && value == propertyValue) {
      returnArray.push(object);
    }

    if ((propertyValue instanceof Array) || (typeof propertyValue === "object")) {
      findObjListByKeyAndValue(returnArray, propertyValue, key, value, isFindArray);
    }
  }
  return returnArray;
}
exports.findObjListByKeyAndValue = findObjListByKeyAndValue;



/*****************************************************************************************************************/
//*************                               Type Conversion 관련                                   *************
/*****************************************************************************************************************/
var Converter = (function () {

  var ConvertBase = function (num) {
    return {
      from: function (baseFrom) {
        return {
          to: function (baseTo) {
            return parseInt(num, baseFrom).toString(baseTo);
          }
        };
      }
    };
  };

  // binary to decimal
  ConvertBase.bin2dec = function (num) {
    return ConvertBase(num).from(2).to(10);
  };

  // binary to hexadecimal
  ConvertBase.bin2hex = function (num) {
    return ConvertBase(num).from(2).to(16);
  };

  // decimal to binary
  ConvertBase.dec2bin = function (num) {
    return ConvertBase(num).from(10).to(2);
  };

  // decimal to hexadecimal
  ConvertBase.dec2hex = function (num) {
    return ConvertBase(num).from(10).to(16);
  };

  // hexadecimal to binary
  ConvertBase.hex2bin = function (num) {
    return ConvertBase(num).from(16).to(2);
  };

  // hexadecimal to decimal
  ConvertBase.hex2dec = function (num) {
    return ConvertBase(num).from(16).to(10);
  };

  //this.ConvertBase = ConvertBase;
  return ConvertBase;
})(this);
exports.Converter = Converter;

function convertSpecialChar2String(str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%\_]/g, function (char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char; // prepends a backslash to backslash, percent,
      case "_":
        return "\\" + char; // prepends a backslash to backslash, percent,
        // and double/single quotes
    }
  });
}
exports.convertSpecialChar2String = convertSpecialChar2String;

///숫자를 8비트 문자열로 리턴함
function d2bin8Byte(number) {
  var returnvalue = "";
  var TempValue = ["0", "0", "0", "0", "0", "0", "0", "0"];
  var TempNumber = number.toString(2);
  var ccount = 7;
  for (var i = TempNumber.length - 1; i >= 0; i--) {
    TempValue[ccount] = TempNumber.charAt(i);

    ccount = ccount - 1;
  }
  for (var i = 0; i < TempValue.length; i++) {
    returnvalue = returnvalue + TempValue[i];
  }
  return returnvalue;
}
exports.d2bin8Byte = d2bin8Byte;

// 자리수 반올림
/* ceil: 올림, round: 반올림, floor: 내림 (Default: round) */
function roundUp(val, precision, option) {
  var returnvalue = 0;
  //option = option == null || option == "" ? "round" : option;
  var p = Math.pow(10, precision);
  switch (option) {
    case "ceil":
      returnvalue = Math.ceil(val * p);
      break;
    case "round":
      returnvalue = Math.round(val * p);
      break;
    case "floor":
      returnvalue = Math.floor(val * p);
      break;
    default:
      returnvalue = Math.round(val * p);
  }

  return returnvalue / p;
}
exports.roundUp = roundUp;



function d2h(d) {
  var returnvalue = d.toString(16);
  if (returnvalue.length == 1) {
    returnvalue = "0" + returnvalue;
  }
  return returnvalue;
}
exports.d2h = d2h;



function h2d(h) {
  return parseInt(h, 16);
}
exports.h2d = h2d;


//바이너리 파일을 hex 코드로 바꾸어줌
function bin2hex(s) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   bugfixed by: Linuxworld
  // +   improved by: ntoniazzi (http://phpjs.org/functions/bin2hex:361#comment_177616)
  // *     example 1: bin2hex('Kev');
  // *     returns 1: '4b6576'
  // *     example 2: bin2hex(String.fromCharCode(0x00));
  // *     returns 2: '00'

  var i, l, o = "",
    n;

  s += "";

  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i).toString(16)
    o += n.length < 2 ? "0" + n : n;
  }
  return o;
}
exports.bin2hex = bin2hex;


// 10진수(Decimal) To 16진수(Hex) /// <returns type="String" />
function number2Hex(number) {
  if (number < 0) {
    number = 0xFFFFFFFF + number + 1;
  }
  return number.toString(16).toUpperCase();
}
exports.number2Hex = number2Hex;

// req.body key 값을 소문자로
function param2Lowercase(req) {
  var returnvalue = {};
  for (param in req.body) {
    returnvalue[param.toLowerCase()] = req.body[param];
  }
  return returnvalue;
}
exports.param2Lowercase = param2Lowercase;


/*****************************************************************************************************************/
//*************                                  Security 관련                                       *************
/*****************************************************************************************************************/
// Make Globally Unique Identifier  /// <returns type="String" />


function GUID() {
  // http://www.ietf.org/rfc/rfc4122.txt
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}
exports.GUID = GUID;

// Sha256 암호화.(Salt 첨가)
function encryptSha256(text, key) {
  const crypto = require('crypto');
  const secret = key == null || key === "" ? text : key;
  const hash = crypto.createHmac('sha256', secret)
    .update(text)
    .digest('hex');
  return hash;
}
exports.encryptSha256 = encryptSha256;

/**
 * @description password를 암호화하여 반환. pbkdf2 알고리즘에 의하여 Sha512 알고리즘 사용한 3단계 암호화 기본.
 * @param {String} password 
 * @param {String} salt
 * @param {function(String)} cb 완성된 암호화 해시 Password를 callback을 통해 반환
 */
function encryptPbkdf2(password, salt, callback) {
  const crypto = require('crypto');
  password = password == null ? "" : password;
  // password, salt, iterations, keylen, digest, callback)
  crypto.pbkdf2(password, salt, 3, 64, 'sha512', (err, key) => {
    if (err) {
      return callback(err)
    }
    // console.log(key.toString('hex')); // '3745e48...aa39b34'
    return callback(key.toString('hex'));
  });
}
exports.encryptPbkdf2 = encryptPbkdf2;

function genCryptoRandomByte(byte) {
  const crypto = require('crypto');
  return crypto.randomBytes(byte || 16).toString('hex');
}
exports.genCryptoRandomByte = genCryptoRandomByte;
/* Aes 확인 http://aes.online-domain-tools.com/ */
// Aes 암호화 (양방향 알고리즘)   /// <returns type="String" />
function encryptAes(text, key) {
  const crypto = require('crypto');
  const value = typeof text !== "string" ? text.toString() : text;
  const secret = key == null ? "" : key;
  /* 암호 종류(여기서는 aes-256-cbc 사용) 암호화 key 적용 객체 생성 */
  var cipher = crypto.createCipher('aes-256-cbc', secret);

  /* 암호화 적용 */
  var encipheredContent = cipher.update(value, 'utf8', 'hex');
  /* 최종 아웃풋 Convert(hex) */
  encipheredContent += cipher.final('hex');

  return encipheredContent;
}
exports.encryptAes = encryptAes;

// Aes 복호화 /// <returns type="String" />
function decryptAes(text, key) {
  try {
    const crypto = require('crypto');
    const value = typeof text !== "string" ? text.toString() : text;
    const secret = key == null ? "" : key;

    // BU.CLIS(value, key, secret)
    var decipher = crypto.createDecipher('aes-256-cbc', secret);

    var decipheredPlaintext = decipher.update(value, 'hex', 'utf8');
    decipheredPlaintext += decipher.final('utf8');
    // BU.CLI(decipheredPlaintext)
    return decipheredPlaintext;
  } catch (error) {
    throw error;
  }

}
exports.decryptAes = decryptAes;






///////////////////////////////////// 이전 버전에서 사용.

function Sha256En(value) {
  var crypto = require('crypto');
  var signer = crypto.createHash('sha256', new Buffer(value, 'utf8'));
  var result = signer.update(new Buffer(value, 'utf8')).digest('hex');
  return result;

}
exports.Sha256En = Sha256En;

//AES 암호화
function AESEn(text, Password) {
  var cipher = crypto.createCipheriv('aes-128-ecb', Password, "");
  var crypted = cipher.update(text, 'ascii', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}
exports.AESEn = AESEn;

//AES 복호화
function AESDe(text, Password) {
  var returnvalue = "";
  try {
    var decipher = crypto.createDecipheriv('aes-128-ecb', Password, "");
    var dec = decipher.update(text, 'hex', 'ascii')
    dec += decipher.final('ascii');
    returnvalue = dec;
  } catch (ex) {
    returnvalue = "";
  }
  return returnvalue;
}
exports.AESDe = AESDe;



/*****************************************************************************************************************/
//*************                                     db 관련                                        *************
/*****************************************************************************************************************/
// mysql 접속 후 해당 객체 반환. 접속이 끊기면 지속적으로 재접속
function connectMysqlContinue(dbinfo, callback) {
  var mysql = require('mysql');
  //CLI(dbConnectionInfo)
  var returnvalue = null;

  returnvalue = mysql.createConnection(dbinfo); // Recreate the connection, since
  // the old one cannot be reused.

  returnvalue.connect(function (err) { // The server is either down
    if (err) { // or restarting (takes a while sometimes).
      log('error when connecting to db:', err);
      setTimeout(connectMysqlContinue, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
    callback(null, returnvalue);
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  returnvalue.on('error', function (err) {
    log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      connectMysqlContinue(dbinfo); // lost due to either server restart, or a
    } else { // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });
}
exports.connectMysqlContinue = connectMysqlContinue;


// 특수문자 str 화 /// <returns type="String" />
function makeSearchField(str) {
  if (isEmpty(str))
    return "";
  //console.log(convertSpecialChar2String(str));

  return convertSpecialChar2String(str);
}
exports.makeSearchField = makeSearchField;


//DB makeReplaceF
function MRF(value) {
  var returnvalue = "";
  // console.log("value",value)
  if ((typeof value !== "string" && typeof value !== "number") && isEmpty(value)) {
    return returnvalue;
  }
  try {
    var str_value = value.toString();
    returnvalue = str_value.split("'").join("''");
    return returnvalue.split("\\").join("\\\\");
  } catch (error) {
    return returnvalue;
  }
}
exports.MRF = MRF;







/*****************************************************************************************************************/
//*************                              Base Prototype 관련                                     *************
/*****************************************************************************************************************/


Object.defineProperty(global, '__stack', {
  get: function () {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function () {
    return __stack[2].getLineNumber();
  }
});

Object.defineProperty(global, '__function', {
  get: function () {

    return __stack[2].getFunctionName();
  }
});

Object.defineProperty(global, '__filename', {
  get: function () {
    return __stack[2].getFileName();
  }
});




/*****************************************************************************************************************/
//*************                                       임시                                           *************
/*****************************************************************************************************************/









/*****************************************************************************************************************/
//*************                                염전 Project 관련                                     *************
/*****************************************************************************************************************/

function sizeChangeID(data) {
  return autoFillString(data, "&", 6, "start");
}
exports.sizeChangeID = sizeChangeID;


function sizeChangeValue(data) {
  var returnvalue = "";
  if (data == null)
    return autoFillString(data, "&", 6);

  var tempData = data.toString();

  if (tempData.indexOf(".") != -1)
    returnvalue = (Number(tempData).toFixed(5)).toString();
  else
    returnvalue = data.toString();

  return autoFillString(returnvalue, "&", 12, "start");
}
exports.sizeChangeValue = sizeChangeValue;

function sizeChangeIsError(Data) {
  var returnvalue = "";

  if (Data == undefined)
    return returnvalue = "9";

  if (Data == "")
    return returnvalue = "0";

  returnvalue = Data;

  return returnvalue;
}
exports.sizeChangeIsError = sizeChangeIsError;

function getRandom(Start, End) {
  var returnvalue = Math.floor(Math.random() * End) + Start;
  return returnvalue;
}
exports.getRandom = getRandom;

// SM Protocol(염전) 생성   /// <returns type="String" />
function makeMessage(str) {
  var jsonText = JSON.stringify(str);
  var buf = new Buffer(jsonText);
  var bufLengthHex = Converter.dec2hex(buf.length);
  var res = autoFillString(bufLengthHex, "0", 4, "start");
  return "SM" + res + jsonText;
}
exports.makeMessage = makeMessage;



// 염전 Map.js SETINFO에서 ID와 일치하는 Name값 추출 ### setJavascript.js 필요  /// <returns type="String" />
function getFindName(storage, propertyValue) {
  require("./setJavascript.js")
  var _ = require("underscore");
  var returnvalue = "";
  _.each(storage, function (property) {
    if ((property instanceof Array) && (typeof property !== "object")) {
      var Target = property.findArrayElementById(propertyValue);
      //log(Target)
      //return;
      if (Target !== null)
        returnvalue = Target.Name;
    }
  });
  return returnvalue;
}
exports.getFindName = getFindName;

function requestHttp(url, callback) {
  //CLI("requestHttp",url)
  var http = require("http");
  http.get(url, function (res) {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];
    var error;
    if (statusCode !== 200) {
      error = new Error("Request Failed.\n" +
        "Status Code:" + statusCode);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error("Invalid content-type.\n" +
        "Expected application/json but received " + contentType);
    }
    if (error) {
      //console.log(error.message);
      // consume response data to free up memory
      res.resume();
      return callback(error, parsedData);
    }

    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function (chunk) {
      rawData += chunk
    });
    res.on('end', function () {
      try {
        var parsedData = JSON.parse(rawData);
        callback(null, parsedData);
      } catch (e) {
        //console.log(e.message);
        callback(e);
      }
    });
  }).on('error', function (e) {
    console.log("Got error:", e);
    callback(e);
  });
}
exports.requestHttp = requestHttp;

// setInfo 기준 url 생성
function makeRequestUrl(findKey, setInfo, callback) {
  var _ = require("underscore");
  var webInfo = setInfo.webServer;
  var findObj = _.find(webInfo.path, function (value, key) {
    return findKey === key;
  })

  return webInfo.url + findObj;
}
exports.makeRequestUrl = makeRequestUrl;