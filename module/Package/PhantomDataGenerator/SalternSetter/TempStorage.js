const _ = require('underscore');


class TempStorage {
  constructor() {
    this.alreadyStorage = [];
    this.mainStorage = [];
    this.insertStorage = [];
    this.updateStorage = [];
  }

  initAlreadyStorage(alreadyStorage){
    this.alreadyStorage = alreadyStorage;
  }

  addStorage(submitObj, findKey, updateKey) {
    let findSubmitObj = _.find(this.mainStorage, storageObj => {
      return storageObj[findKey] === submitObj[findKey];
    });

    if (_.isEmpty(findSubmitObj)) {
      this.mainStorage.push(submitObj);
    } else {
      throws `중복 "${findKey}"가 존재합니다`;
    }

    return this.processStorageForQuery(submitObj, findKey, updateKey);
  }

  processStorageForQuery(submitObj, findKey, updateKey) {
    let findAlready = _.find(this.alreadyStorage, storageObj => {
      return storageObj[findKey] === submitObj[findKey];
    });
    // Insert
    if (_.isEmpty(findAlready)) {
      this.insertStorage.push(submitObj)
    } else {
      submitObj[updateKey] = findAlready[updateKey];
      this.updateStorage.push(submitObj);
    }

    return true;
  }

  getFinalStorage(){
    return {
      insertObjList: this.insertStorage,
      updateObjList: this.updateStorage
    }
  }

}

module.exports = TempStorage;