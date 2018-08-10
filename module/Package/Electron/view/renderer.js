const {
  ipcRenderer
} = require('electron');
const $ = require('jquery');

const moment = require('moment');
console.log();

const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;

// jsdoc intelligence 를 위함
require('../models/excel.util');

const mainChart = require('./mainChart');




let remainReloadSec = 60;
function initRemainReloadSec() {
  remainReloadSec = 60; 
}

let nowDate = moment().date();
function reloadMain(){
  setInterval(() => {
    remainReloadSec--;
    document.querySelector('#reload-sec').innerHTML = remainReloadSec;

    // 시간이 다되면 새로 고침
    if(remainReloadSec === 0){
      // 날짜가 변경되었다면
      nowDate = 18;
      if(nowDate !== moment().date()){
        nowDate = moment().date();
        document.querySelector('#start_date_input').value = moment().format('YYYY-MM-DD');
      }
      ipcRenderer.send('navigationMenu', 'navi-main', getSearchOption());
    }
  }, 1000);
}
// 한번만 실행
_.once(reloadMain);
reloadMain();

ipcRenderer.send('navigationMenu', 'navi-main', getSearchOption());
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

// 검색 타입 클릭
let trendSelectList = document.querySelectorAll('#sel_type_div_area input');
trendSelectList.forEach(ele => {
  ele.addEventListener('click', event => {
    setterSelectType(event.target.value);
  });
});

document.querySelector('#searchPower').addEventListener('click', () => {
  initRemainReloadSec();
  let searchInfo = getSearchOption();
  ipcRenderer.send('powerChart', searchInfo);
});


// document.querySelector('#searchTrend').addEventListener('click', () => {
//   let searchInfo = getSearchOption();
//   ipcRenderer.send('navigationMenu', 'navi-trend', JSON.stringify(searchInfo) );
// });

document.querySelector('#reload').addEventListener('click', () => {
  ipcRenderer.send('navigationMenu', 'navi-main', getSearchOption());
});

document.querySelector('#download_excel').addEventListener('click', () => {
  initRemainReloadSec();
  ipcRenderer.send('makeExcel', getSearchOption());
  // writeFileExcel(excelFile, getSearchOption());
});


ipcRenderer.on('download-excel', (event, data) => {
  writeFileExcel(data);
});

/* from app code, require('electron').remote calls back to main process */
const dialog = require('electron').remote.dialog;
function writeFileExcel(excelFile) {
  const XLSX = require('xlsx');
  /* show a file-open dialog and read the first selected file */
  try {
    var o = dialog.showSaveDialog();
    console.log(excelFile);
    XLSX.writeFile(excelFile, o);
  } catch (error) {
    console.error(error);    
  }
}

ipcRenderer.on('main-chart', (event, data) => {
  makeMainPowerChart(data);
});

/**
 * 
 * @param {{chartData: chartData, chartDecoration: chartDecoration}} data 
 */
function makeMainPowerChart(data) {
  console.log(data);
  const chartData = _.get(data, 'chartData');
  mainChart.makeMainChart(chartData, _.get(data, 'chartDecoration', {}));
}

ipcRenderer.on('main-reply', (event, data) => {
  $('#navigation li').removeClass('active');
  $('#navi-main').parent().addClass('active');

  initRemainReloadSec(); 

  var searchType = _.get(data, 'searchOption.search_type');
  var selectedObj = $('#sel_type_div_area').find('input[value=' + searchType + ']');
  // document.querySelector(`#sel_type_div_area input[value=${searchType}]`)

  $(selectedObj).trigger('click');


  const largeInverter = _.get(data, 'largeInverter');
  const smallInverter = _.get(data, 'smallInverter');
  // const weatherCastInfo = _.get(mainData, 'weatherCastInfo');
  // document.querySelector('#weatherTemperature').value = _.get(weatherCastInfo, 'temp');
  // document.querySelector('#weatherImg').src = `../public/image/weather_${_.get(weatherCastInfo, 'wf')}.png` ;
  // document.querySelector('#measureTime').innerHTML = `측정시간: ${`${BU.convertDateToText(new Date(), '', 4)}:00`}` ;

  // var powerGenerationInfo = mainData.powerGenerationInfo;

  var device_list = _.get(data, 'searchOption.device_list');
  console.log(data.searchOption);

  let selectListDom = document.getElementById('device_list_sel');
  selectListDom.innerHTML = '';
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
    selectListDom.add(option);
  });


  const largeInputDomList = document.querySelectorAll('input[name=large]');
  largeInputDomList.forEach(ele => {
    let comment = '';
    if(ele.dataset.type){
      comment = ` ${ele.dataset.type}`;
    }
    let value = _.get(largeInverter, ele.dataset.id, '');
    console.log(value);
    ele.value = value === null ? comment : value + comment;
  });
  const smallInputDomList = document.querySelectorAll('input[name=small]');
  smallInputDomList.forEach(ele => {
    let comment = '';
    if(ele.dataset.type){
      comment = ` ${ele.dataset.type}`;
    }
    let value = _.get(smallInverter, ele.dataset.id, '');
    ele.value = value === null ? comment : value + comment;
  });

  const largePDomList = document.querySelectorAll('p[name=large]');
  largePDomList.forEach(ele => {
    let header = '누적 발전량: ';
    let comment = '';
    if(ele.dataset.type){
      comment = ` ${ele.dataset.type}`;
    }
    let value = _.get(largeInverter, ele.dataset.id, '');
    console.log(value);
    ele.innerHTML = value === null ? header + comment : header + value + comment;
  });
  const smallPDomList = document.querySelectorAll('p[name=small]');
  smallPDomList.forEach(ele => {
    let header = '누적 발전량: ';
    let comment = '';
    if(ele.dataset.type){
      comment = ` ${ele.dataset.type}`;
    }
    let value = _.get(smallInverter, ele.dataset.id, '');
    ele.innerHTML = value === null ? header + comment : header + value + comment;
  });

  const largeTdDomList = document.querySelectorAll('td[name=large]');
  largeTdDomList.forEach(ele => {
    let value = _.get(largeInverter, ele.dataset.id, '');
    ele.innerHTML = value === null ? '' : value;
  });
  const smallTdDomList = document.querySelectorAll('td[name=small]');
  smallTdDomList.forEach(ele => {
    let value = _.get(smallInverter, ele.dataset.id, '');
    ele.innerHTML = value === null ? '' : value;
  });

  makeMainPowerChart(data);

  $('#menu-main').removeClass('hidden');
  $('#menu-trend').addClass('hidden');

  // BU.CLI(largeInverter);
  mainChart.makeGaugeChart(largeInverter, 'chart_div_1');
  mainChart.makeGaugeChart(smallInverter, 'chart_div_2');
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
  // var endDateDom = document.querySelector('#end_date_input');

  // console.log(startDateDom.value);
  var startDate = startDateDom.value ? moment(startDateDom.value) : moment();
  
  var viewMode = 0;
  checkedSearchType === 'range' ? $('#end_date_input').show() : $('#end_date_input').hide();

  if (checkedSearchType === 'month') {
    viewMode = 2;
    startDate = startDate.format('YYYY');
  } else if (checkedSearchType === 'day') {
    viewMode = 1;
    startDate = startDate.format('YYYY-MM');
  } else if (checkedSearchType === 'range') {
    // makeDatePicker(endDateDom, 0);
    // endDateDom.value = endDate.toISOString().substring(0, sliceEndIndex);
  } else {
    viewMode = 0;
    startDate = startDate.format('YYYY-MM-DD');
  }
  startDateDom.value = startDate;
  makeDatePicker(startDateDom, viewMode);
}

// 검색 클릭 시
function getSearchOption() {
  var $deviceListDom = $('#device_list_sel option:checked');
  var searchType = _.get(document.querySelector('#sel_type_div_area input[name="searchType"]:checked'), 'value');
  var startDate = document.getElementById('start_date_input').value;

  var device_seq = $deviceListDom.val();
  return {
    device_seq,
    start_date: startDate,
    search_type: searchType
  };
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


ipcRenderer.on('trend-replay', (event, data) => {
  $('#navigation li').removeClass('active');
  $('#navi-trend').parent().addClass('active');
  
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
  // excelFile = _.get(data, 'workBook');
});