const _ = require('underscore');


class TempStorage {
  constructor() {
    this.alreadyStorage = [];
    this.mainStorage = [];
    this.insertStorage = [];
    this.updateStorage = [];
  }

  /**
   * 기존 DB에 저장되어 있는 데이터 리스트 초기화
   * @param {Array} alreadyStorage DB에서 긁어온 내용
   */
  initAlreadyStorage(alreadyStorage){
    this.alreadyStorage = alreadyStorage;
  }

  /**
   * 저장소에 데이터 저장. 'uniqueKey' 값이 동일한 mainStorage에 있다면 중복 에러 발생 Throw
   * Insert or Update 판단 Fn 호출
   * @param {Object} submitObj 체크할 Object
   * @param {String} uniqueKey Unique Key로써 식별할 수 있는 유일키
   * @param {String} updateKey Unique Key로써 update Rows를 찾아갈 수 있는 유일키
   */
  addStorage(submitObj, uniqueKey, updateKey) {
    let findSubmitObj = _.find(this.mainStorage, storageObj => {
      return storageObj[uniqueKey] === submitObj[uniqueKey];
    });

    if (_.isEmpty(findSubmitObj)) {
      this.mainStorage.push(submitObj);
    } else {
      throw `중복 "${uniqueKey}"가 존재합니다`;
    }

    return this.processStorageForQuery(submitObj, uniqueKey, updateKey);
  }

  /**
   * Insert와 Update 구문을 Storage에 각각 저장
   * @param {Object} submitObj 체크할 Object
   * @param {String} uniqueKey Unique Key로써 식별할 수 있는 유일키
   * @param {String} updateKey Unique Key로써 update Rows를 찾아갈 수 있는 유일키
   */
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

  /**
   * 최종 결과물을 반환
   * @returns {Object} {insertObjList,updateObjList}
   */
  getFinalStorage(){
    return {
      insertObjList: this.insertStorage,
      updateObjList: this.updateStorage
    }
  }

}

module.exports = TempStorage;