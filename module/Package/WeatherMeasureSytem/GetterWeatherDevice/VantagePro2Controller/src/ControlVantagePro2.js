
const {Builder, InterfaceClient} = require('device-client-controller-jh');


class ControlVantagePro2 extends InterfaceClient {
  constructor() {
    super();


    this.builder = new Builder();


    this.builder.addDeviceClient()

    

  }
}

module.exports = ControlVantagePro2;