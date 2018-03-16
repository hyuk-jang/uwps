
const _ = require('underscore');


class DeviceDataStorage {
  constructor() {

    this.deviceStorageDataList = [];
    this.deviceStorageControllerList = [];
  }

  /**
   * 
   * @param {string} deviceCategory 
   * @param {Object|Object[]} deviceConfigInfo 
   * @param {{id: string, tableId: string}} keySetInfo 
   */
  setDevice(deviceCategory, deviceConfigInfo, keySetInfo){
    if(Array.isArray(deviceConfigInfo)){
      deviceConfigInfo.forEach(currentItem => {
        return this.setDevice(deviceCategory, currentItem);
      });
    }

    // Category에 맞는 StorageData를 가져옴
    let foundData = this.getMatchingCategoryFromDataList(deviceCategory);

    // 없다면 새로 생성
    if(foundData === undefined){
      let newStorageData = {
        key: deviceCategory,
        measureDate: null,
        insertTroubleList: [],
        updateTroubleList: [],
        insertDataList: [],
        storage: []
      };

      this.deviceStorageDataList.push(newStorageData);
      foundData = newStorageData;
    }


    let addControllerObj = {
      key: deviceType,
      storage: []
    };

    const addDataStorageObj = {
      id: deviceConfigInfo[keySetInfo.id],
      tableId: deviceConfigInfo[keySetInfo.tableId] ? deviceConfigInfo[keySetInfo.tableId] : '',
      systemErrorList: [],
      data: null,
      convertData: null,
      troubleList: []
    };
  }


  /**
   * 장치 카테고리에 맞는 타입을 가져옴
   * @param {string} deviceCategory 장치 카테고리 'inverter', 'connector' ... etc
   */
  getMatchingCategoryFromDataList(deviceCategory) {
    const deviceStorageData = _.findWhere(this.deviceStorageDataList, {
      key: deviceCategory
    });

    return deviceStorageData;
  }




}