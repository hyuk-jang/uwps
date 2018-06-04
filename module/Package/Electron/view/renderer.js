const {
  ipcRenderer
} = require('electron');
const $ = require('jquery');
const Highcharts = require('highcharts');

const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;


const mainChart = require('./mainChart');

ipcRenderer.send('navigationMenu', 'navi-main');
// ipcRenderer.send('navigationMenu', 'navi-trend');

let navigationList = document.querySelectorAll('#navigation a');
navigationList.forEach(ele => {
  ele.addEventListener('click', event => {
    let id;
    if(event.target.tagName === 'I'){
      id = event.target.parentNode.id;
    } else {
      id = event.target.id;
    }

    switch (id) {
    case 'navi-main':
      ipcRenderer.send('navigationMenu', id);
      break;
    case 'navi-trend':
      ipcRenderer.send('navigationMenu', id);
      break;
    default:
      break;
    }
  });
});

// 트렌드 버튼 클릭
let trendSelectList = document.querySelectorAll('#sel_type_div_area input');
trendSelectList.forEach(ele => {
  ele.addEventListener('click', event => {
    setterSelectType(event.target.value);
  });
});

document.querySelector('#searchMain').addEventListener('click', event => {
  let searchInfo = searchTrend();
  ipcRenderer.send('navigationMenu', 'navi-main', JSON.stringify(searchInfo) );
});


document.querySelector('#searchTrend').addEventListener('click', event => {
  let searchInfo = searchTrend();
  ipcRenderer.send('navigationMenu', 'navi-trend', JSON.stringify(searchInfo) );
});

// document.querySelector('#downloadExcel').addEventListener('click', event => {
//   writeFileExcel(excelFile);
// });


let saveSearchRange;
let excelFile;
const XLSX = require('xlsx');
ipcRenderer.on('trend-replay', (event, data) => {
  $('#navigation li').removeClass('active');
  $('#navi-trend').parent().addClass('active');
  
  var searchRange = _.get(data, 'searchOption.search_range');
  saveSearchRange = searchRange;
  var searchType = _.get(data, 'searchOption.search_type');
  var selectedObj = $('#sel_type_div_area').find('input[value=' + searchType + ']');
  // document.querySelector(`#sel_type_div_area input[value=${searchType}]`)

  $(selectedObj).trigger('click');

  $('#menu-trend').removeClass('hidden');
  $('#menu-main').addClass('hidden');


  var device_list = _.get(data, 'searchOption.device_list');

  let listDom = document.getElementById('device_list_sel');
  listDom.innerHTML = '';
  _.forEach(device_list, deviceInfo => {
    var option = document.createElement('option');
    option.text = _.get(deviceInfo, 'target_name');
    // option.attributes = ('data-type', _.get(deviceInfo, 'type'));
    option.value = _.get(deviceInfo, 'seq');
    if(_.get(deviceInfo, 'seq') === _.get(data, 'searchOption.device_seq')){
      option.selected = true;
    } else {
      option.selected = false;
    }

    listDom.add(option);
  });

  setterSelectType(_.get(data, 'searchOption.search_type'), _.get(data, 'searchOption.search_range'));


  mainChart.makeTrendChart(_.get(data, 'powerChartData'), _.get(data, 'chartDecorator'));
  excelFile = _.get(data, 'workBook');
});

/* from app code, require('electron').remote calls back to main process */
const dialog = require('electron').remote.dialog;
function writeFileExcel() {
  /* show a file-open dialog and read the first selected file */
  try {
    var o = dialog.showSaveDialog();
    console.log(excelFile);
    XLSX.writeFile(excelFile, o);
  } catch (error) {
    console.error(error);    
  }
}

ipcRenderer.on('main-reply', (data, mainData) => {
  $('#navigation li').removeClass('active');
  $('#navi-main').parent().addClass('active');

  var searchRange = _.get(mainData, 'searchOption.search_range');
  saveSearchRange = searchRange;
  var searchType = _.get(mainData, 'searchOption.search_type');
  var selectedObj = $('#sel_type_div_area').find('input[value=' + searchType + ']');
  // document.querySelector(`#sel_type_div_area input[value=${searchType}]`)

  $(selectedObj).trigger('click');

  const chartData = _.get(mainData, 'chartData');
  const largeInverter = _.get(mainData, 'largeInverter');
  const smallInverter = _.get(mainData, 'smallInverter');
  // const weatherCastInfo = _.get(mainData, 'weatherCastInfo');
  // document.querySelector('#weatherTemperature').value = _.get(weatherCastInfo, 'temp');
  // document.querySelector('#weatherImg').src = `../public/image/weather_${_.get(weatherCastInfo, 'wf')}.png` ;
  // document.querySelector('#measureTime').innerHTML = `측정시간: ${`${BU.convertDateToText(new Date(), '', 4)}:00`}` ;

  // var powerGenerationInfo = mainData.powerGenerationInfo;

  const largeInputDomList = document.querySelectorAll('input[name=large]');
  largeInputDomList.forEach(ele => {
    let comment = '';
    if(ele.dataset.type){
      comment = ` ${ele.dataset.type}`;
    }
    ele.value = _.get(largeInverter, ele.dataset.id, '') + comment;
  });
  const smallInputDomList = document.querySelectorAll('input[name=small]');
  smallInputDomList.forEach(ele => {
    let comment = '';
    if(ele.dataset.type){
      comment = ` ${ele.dataset.type}`;
    }
    ele.value = _.get(smallInverter, ele.dataset.id, '') + comment;
  });

  const largeTdDomList = document.querySelectorAll('td[name=large]');
  largeTdDomList.forEach(ele => {
    ele.innerHTML = _.get(largeInverter, ele.dataset.id, '');
  });
  const smallTdDomList = document.querySelectorAll('td[name=small]');
  smallTdDomList.forEach(ele => {
    ele.innerHTML = _.get(smallInverter, ele.dataset.id, '');
  });



  $('#menu-main').removeClass('hidden');
  $('#menu-trend').addClass('hidden');

  $('#testest').trigger('click');

  mainChart.makeMainChart(chartData);
  mainChart.makeGaugeChart(largeInverter, 'chart_div_1');
  mainChart.makeGaugeChart(smallInverter, 'chart_div_2');


  // const inverterStatus = _.get(mainData, 'inverterStatus');
  // var total_in_kw = inverterStatus.totalInfo.in_kw;
  // var total_out_kw = inverterStatus.totalInfo.out_kw;
  // var total_d_kwh = inverterStatus.totalInfo.d_kwh;
  // var total_c_kwh = inverterStatus.totalInfo.c_kwh;

  // let myTable = document.querySelector('#myTable');
  // myTable.innerHTML = '';
  // _.forEach(inverterStatus.dataList, inverterData => {
  //   var tr = document.createElement('tr');
  //   let columnKey = ['target_name', 'in_v', 'in_a', 'in_kw', 'out_v', 'out_a', 'out_kw', 'p_f', 'd_kwh', 'c_kwh', 'hasOperation'];
  //   columnKey.forEach((key, index) => {
  //     let td = document.createElement('td');
  //     if(index === 0){
  //       td.className = 'td1';
  //     }
  //     if(columnKey.length === index + 1){
  //       td.className = 'center_ball';
  //       let img = document.createElement('img');
  //       var deviceOperationImgName = inverterData[key] ? 'green' : 'red';
  //       img.src = `../public/image/${deviceOperationImgName}.png`;
  //       td.appendChild(img);
  //     } else {
  //       td.innerText = inverterData[key];
  //     }
  //     tr.appendChild(td);
  //   });

  //   myTable.appendChild(tr);
  // });
});




/**
 * 검색 기간 Radio 클릭 시 날짜 영역 설정
 * @param {Dom} input[name='searchType']
 * @return {void} 
 */
function setterSelectType(selectType) {
  // let searchRange = saveSearchRange;
  var checkedSearchType = selectType;
  var startDateDom = document.querySelector('#start_date_input');
  var endDateDom = document.querySelector('#end_date_input');

  var startDate = new Date(saveSearchRange.strStartDateInputValue);
  var endDate = saveSearchRange.strEndDateInputValue === '' || new Date(saveSearchRange.strEndDateInputValue) ===
            'Invalid Date' ? startDate : new Date(saveSearchRange.strEndDateInputValue);

  var viewMode = 0;
  var sliceEndIndex = 10;

  checkedSearchType === 'range' ? $('#end_date_input').show() : $('#end_date_input').hide();

  if (checkedSearchType == 'month') {
    viewMode = 2;
    sliceEndIndex = 4;
  } else if (checkedSearchType == 'day') {
    viewMode = 1;
    sliceEndIndex = 7;
  } else if (checkedSearchType == 'range') {
    makeDatePicker(endDateDom, 0);
    endDateDom.value = endDate.toISOString().substring(0, sliceEndIndex);
  } else {
    viewMode = 0;
    sliceEndIndex = 10;
  }
  startDateDom.value = startDate.toISOString().substring(0, sliceEndIndex);
  makeDatePicker(startDateDom, viewMode);
}

// 검색 클릭 시
function searchTrend() {
  var $deviceListDom = $('#device_list_sel option:checked');
  var searchType = document.querySelector('#sel_type_div_area input[name="searchType"]:checked').value;
  var startDate = document.getElementById('start_date_input').value;
  var endDate = '';

  if (searchType === 'range') {
    endDate = document.getElementById('end_date_input').value;
    if (startDate > endDate) {
      return alert('종료일이 시작일보다 빠를 수 없습니다.');
    }
  }
  var device_list_type = $deviceListDom.data('type');
  var device_seq = $deviceListDom.val();
  return {
    device_list_type,
    device_seq,
    start_date: startDate,
    end_date: endDate,
    search_type: searchType
  };

  // BU.CLI({
  //   device_list_type,
  //   device_seq,
  //   startDate,
  //   endDate,
  //   searchType
  // });

  // ipcRenderer.send('navigationMenu', 'navi-trend', {
  //   device_list_type,
  //   device_seq,
  //   startDate,
  //   endDate,
  //   searchType
  // });

  // var locationHref = 'trend?device_list_type=' + encodeURIComponent(device_list_type) + '&device_seq=' + encodeURIComponent(device_seq) + '&start_date=' + encodeURIComponent(startDate) + '&end_date=' + encodeURIComponent(endDate) + '&search_type=' + encodeURIComponent(searchType);
  // // alert(locationHref)
  // return location.href = locationHref;
}



function makeDatePicker(dom, viewMode) {
  viewMode = $.isNumeric(viewMode) ? viewMode : 0;

  var dateFormat = '';
  switch (viewMode) {
  case 0:
    dateFormat = 'yyyy-mm-dd';
    break;
  case 1:
    dateFormat = 'yyyy-mm';
    break;
  case 2:
    dateFormat = 'yyyy';
    break;
  default:
    break;
  }

  $(dom).datepicker('remove');
  // console.log('dateFormat', dateFormat, viewMode);
  $(dom).datepicker({
    format: dateFormat,
    language: 'kr',
    autoclose: 1,
    todayHighlight: 1,
    clearBtn: 1,
    minViewMode: viewMode
    //mode: 0-일,1-월,2-년
  });
}