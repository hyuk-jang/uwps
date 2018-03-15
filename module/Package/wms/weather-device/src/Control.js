

const SmInfrared = require('../sm-infrared');
const Vantagepro2 = require('../vantagepro2');


const config = require('./config');

class Control {
  /** @param {config} config */
  constructor(config) {
    this.config = config.current;


    this.smInfrared = new SmInfrared(config.smInfrared);
    this.vantagepro2 = new SmInfrared(config.vantagepro2);
  }
  
  init(){
    this.smInfrared.setDeviceClient(config.smInfrared.current.deviceInfo);
    this.vantagepro2.setDeviceClient(config.vantagepro2.current.deviceInfo);
    
  }




}
module.exports = Control;