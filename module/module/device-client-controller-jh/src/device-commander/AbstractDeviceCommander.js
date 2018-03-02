

class AbstractDeviceCommander {
  constructor(config) {
    this.protocolConverter = {};
  }

  updateDcConnect(){
  }

  updateDcClose(){
  }

  updateDcError(){
  }

  updateDcData(){

  }
  updateDcTimeout(){
  }
}
module.exports = AbstractDeviceCommander;