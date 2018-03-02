'use strict';
const _ = require('underscore');

require('../format/define');

class DeviceIterator {
  /** @param {DeviceManager} deviceManager */
  constructor(deviceManager) {
    /**
     * @type {{process:commandFormat, rankList: Array.<{rank: number, list: Array.<commandFormat>} }>]  }
     */
    this.aggregate = deviceManager.commandStorage;

  }

  /** @param {commandFormat} cmd */
  addCmd(cmd) {
    let rank = cmd.rank;

    if(!_.contains(_.pluck(this.aggregate.rankList, 'rank'), rank)){
      this.aggregate.rankList.push({rank, list: [cmd] });
    } else {
      let foundRank = _.findWhere(this.aggregate.rankList, {rank});
      foundRank.list.push(cmd);
    }

    if (_.isEmpty(this.aggregate.process)) {
      this.nextRank();
    }
  }

  /** 현재 진행 중인 명령 리스트 Index 1 증가하고 다음 진행해야할 명령 반환 */
  nextCmd (){
    const processInfo = this.aggregate.process;
    if(_.isEmpty(processInfo)){
      return null;
    } else {
      processInfo.currCmdIndex += 1;
      return processInfo.currCmdIndex === processInfo.cmdList.length ? this.nextRank() : this.currentCmd();
    }
  }

  /** 다음 진행해야 */
  nextRank (){
    this.aggregate.rankList = _.sortBy(this.aggregate.rankList, rankInfo  => rankInfo.rank);

    let foundRankInfo = _.find(this.aggregate.rankList, rankInfo => {
      return rankInfo.list.length;
    });

    if(_.isEmpty(foundRankInfo)){
      this.aggregate.process = {};
      return this.isDone();
    } else {
      this.aggregate.process = foundRankInfo.list.shift();

      return this.currentCmd();  
    }
  }

  clear (){
    this.aggregate.process = {};
  }

  isDone (){
    console.trace('is Done');
    return null;
  }

  currentCmd() {
    return this.aggregate.process.cmdList[this.aggregate.process.currCmdIndex];
  }

  currentReceiver() {
    let currItem = this.currentItem();
    return _.isEmpty(currItem) ? null : currItem.observer;
  }

  currentItem (){
    return this.aggregate.process;
  }
}
module.exports = DeviceIterator;