'use strict';

/**
 * @class AbstractDeviceController
 */
class AbstractDeviceController {
  constructor() {
    this.observers = [];
  }

  setInit(){}
  async connect(){}
  disconnect(){}
  async write(){}

  attach(observer){
    this.observers.push(observer);
    console.log('Observer attached');
  }

  dettach(observer){
    for(let i in this.observers)
      if(this.observers[i] === observer)
        this.observers.splice(i, 1);
  }


  notifyConnect(){
    console.log('notifyConnect');
    // for(let i in this.observers){
    //   this.observers[i].updateDcConnect();
    // }
  }
  notifyClose(){
    console.log('notifyClose');
    // for(let i in this.observers){
    //   this.observers[i].updateDcClose();
    // }
  }
  notifyError(error){
    console.log('notifyError', error);
    // for(let i in this.observers){
    //   this.observers[i].updateDcError(error);
    // }
  }
  notifyData(data){
    console.log('notifyData', data);
    // for(let i in this.observers){
    //   this.observers[i].updateDcData(data);
    // }
  }
}

module.exports = AbstractDeviceController;