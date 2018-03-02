// const AbstractDeviceController = require('../device-controller/AbstractDeviceController.js');
class AbstractDeviceManager {
  constructor() {
    this.mediator;
  }

  setInit(){}
  async connect(){
    await this.deviceController.connect();
  }
  disconnect(){}
  async write(){}

  // spreadDeviceObserver(eventName, eventMsg) {
  //   if(this.mediator){
  //     this.mediator.spreadDeviceObserver(eventName, eventMsg);
  //   }
  // }

  updateDcConnect(){
    console.log('updateDcConnect');
    this.mediator.updateDcConnect('dcConnect');
  }
  updateDcClose(){
    console.log('updateDcClose');
    this.mediator.updateDcClose('dcClose');
  }
  updateDcError(error){
    console.log('updateDcError');
    this.mediator.updateDcError('dcError', error);
  }
  updateDcData(data){
    console.log('updateDcData');
    this.getReceiver().updateDcData(this.getProcessItem(), data); 
  }

  updateDcTimeout(){
    console.log('updateDcTimeout');
    this.getReceiver().updateDcTimeout(this.getProcessItem());
  }
}

module.exports = AbstractDeviceManager;