const {
  ipcRenderer
} = require('electron');
const $ = require('jquery');
const Highcharts = require('highcharts');

const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;

let list = document.querySelectorAll('#navigation');
list.forEach(ele => {
  ele.addEventListener('click', event => {
    console.log(event.target.id);
    let msg;
    switch (event.target.id) {
    case 'navi-main':
      ipcRenderer.send('navigationMenu', event.target.id);
      break;
    case 'navi-trend':
      ipcRenderer.send('navigationMenu', event.target.id);
      break;
    default:
      break;
    }

  });

});

document.querySelector('#searchTrend').addEventListener('click', event => {
  let searchInfo = searchTrend();
  BU.CLI(searchInfo);
  ipcRenderer.send('navigationMenu', ['navi-trend', searchInfo]);
});




const XLSX = require('xlsx');
ipcRenderer.on('trend-replay', (event, data) => {
  $('#navigation li').removeClass('active');
  $('#navi-trend').parent().addClass('active');

  BU.CLI(data.chartDecorator);
  BU.CLI(data.searchOption);

  var searchRange = _.get(data, 'searchOption.search_range');
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




  mainChart.makeTrendChart(_.get(data, 'powerChartData'), _.get(data, 'chartDecorator'));

  $('#downloadExcel').on('click', () => {
    downloadExcel(searchRange, _.get(data, 'workBook'));
  });
});

function downloadExcel(searchRange, workBook) {
  // var fileName = '';
  // if (searchRange.rangeEnd) {
  //   fileName = searchRange.rangeStart + '~' + searchRange.rangeEnd;
  // } else {
  //   fileName = searchRange.rangeStart;
  // }
  /* from app code, require('electron').remote calls back to main process */
  var dialog = require('electron').remote.dialog;

  /* show a file-open dialog and read the first selected file */
  var o = dialog.showSaveDialog();

  XLSX.writeFile(workBook, o);
  // XLSX.writeFile(workBook, fileName + '.xlsx');
}

const mainChart = require('./mainChart');


ipcRenderer.on('main-reply', (data, mainData) => {
  $('#navigation li').removeClass('active');
  $('#navi-main').parent().addClass('active');


  var powerGenerationInfo = mainData.powerGenerationInfo;

  const list = document.querySelectorAll('input[name=powerInfo]');

  list.forEach(ele => {
    ele.value = _.get(powerGenerationInfo, ele.id);
  });

  let inverterOperation = document.querySelector('#inverterOperation');
  if (_.get(powerGenerationInfo, 'hasOperationInverter') === true) {
    inverterOperation.className = 'btn btn-primary';
    inverterOperation.textContent = 'RUN';
  } else {
    inverterOperation.className = 'btn btn-warning';
    inverterOperation.textContent = 'STOP';
  }

  $('#menu-main').removeClass('hidden');
  $('#menu-trend').addClass('hidden');

  mainChart.makeMainChart(mainData.dailyPowerChartData);
  // mainChart.makeGaugeChart(mainData.powerGenerationInfo);
});

// ipcRenderer.send('navigationMenu', 'navi-main');
ipcRenderer.send('navigationMenu', 'navi-trend');


/**
 * 검색 기간 Radio 클릭 시 날짜 영역 설정
 * @param {Dom} input[name='searchType']
 * @return {void} 
 */
function setterSelectType(target) {
  var checkedSearchType = target.value;
  var startDateDom = document.querySelector('#start_date_input');
  var endDateDom = document.querySelector('#end_date_input');

  var startDate = new Date();
  var endDate = new Date();

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
  console.log('@@@@@@@@@@@@@@@@@@@@@@', 'searchTrend');
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
  console.log('ttt');
  return {
    device_list_type,
    device_seq,
    startDate,
    endDate,
    searchType
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
  console.log('dateFormat', dateFormat, viewMode);
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