const bmjh = require('base-model-jh');
const Promise = require('bluebird')
const BU = require('base-util-jh').baseUtil;

class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  // 장치 구성 정보 설정
  async setDeviceStructure(structureInfoList) {
    let deviceStructureList = await this.getTable('device_structure');
    let structureHeaderList = _.pluck(deviceStructureList, 'structure_header');

    let insertList = [];

    structureInfoList.forEach(structureInfo => {
      if (!_.contains(structureHeaderList, structureInfo.structure_header)) {
        insertList.push(structureInfo);
      }
    });

    if (!insertList.length) {
      return false;
    }
    return this.setTables('device_structure', insertList);
  }

  // map Img 설정 정보에서 정의한 이름을 찾아줌
  findTargetName(key, value) {
    let returnvalue = '';
    _.each(this.mapImgInfo, category => {
      if (typeof category === 'object') {
        category.some(obj => {
          if (obj[key] == value) {
            returnvalue = obj.Name;
          }
        })
      }
    })
    return returnvalue;
  }


  async setDeviceInfo(mapSetInfo) {
    let regx = /\d/;
    let deviceStructureList = await this.getTable('device_structure');
    let salternDeviceInfoList = await this.getTable('saltern_device_info');

    let submitDataList = [];
    let insertList = [];
    let updateList = [];


    _.each(mapSetInfo, category => {
      _.each(category, deviceInfo => {
        let regExec = regx.exec(deviceInfo.ID);
        let headerName = deviceInfo.ID.substr(0, regExec.index);

        let submitDataObj = {
          device_structure_seq: _.findWhere(deviceStructureList, {
            structure_header: headerName
          }).device_structure_seq,
          target_id: deviceInfo.ID,
          target_name: this.findTargetName('ID', deviceInfo.ID),
          device_type: deviceInfo.DeviceType === 'Serial' ? 'serial' : 'socket',
          board_id: deviceInfo.BoardID ? deviceInfo.BoardID : '',
          port: deviceInfo.Port
        }

        let findSubmitObj = _.findWhere(submitDataList, {
          target_id: submitDataObj.target_id
        });
        if (!_.isEmpty(findSubmitObj)) {
          return Error('중복 ID 발생');
        }

        let findAlready = _.findWhere(salternDeviceInfoList, {
          target_id: submitDataObj.target_id
        });
        // Insert
        if (_.isEmpty(findAlready)) {
          insertList.push(submitDataObj)
        } else {
          submitDataObj.saltern_device_info_seq = findAlready.saltern_device_info_seq;
          updateList.push(submitDataObj);
        }
      })
    })

    BU.CLIS(submitDataList,insertList,updateList)


    return true;

    this.setTables('saltern_device_info', insertList, true)
      .then(result => {
        return new Promise(resolve => {
          return Promise.map(updateList, updateObj => {
              return this.updateTable(updateObj);
            })
            .then(result => {
              resolve(result)
            })
        })
      })

    return true;

  }




  getDailyPowerReport() {
    // date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w` +
      ` from inverter_data ` +
      ` where writedate>= CURDATE() and writedate<CURDATE() + 1` +
      ` group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    return this.db.single(sql)
      .then(result => {
        // BU.CLI(result)
        let dateList = _.pluck(result, 'writedate');
        let whList = _.pluck(result, 'out_w');
        let chartList = [
          dateList,
          whList,
        ];

        return {
          chartList,
          dailyPowerRange: {
            start: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + '00:00:00',
            end: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + _.last(dateList) + ':00',
          }
        }
      });
  }

}
module.exports = BiModule;