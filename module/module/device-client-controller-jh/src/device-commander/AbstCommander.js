

class AbstCommander {
  constructor() {
    this.protocolConverter = {};
    this.id = null;
    this.mediator = null;
  }

  setMediator() {}

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
module.exports = AbstCommander;