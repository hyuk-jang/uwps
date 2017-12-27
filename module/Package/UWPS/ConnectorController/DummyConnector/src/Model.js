const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

class Model {
  constructor(controller) {
    this.controller = controller;

    this.config = controller.config;
    this.socketServerPort = 0;

    this.connectorData = {
      // Pv Info
      amp: null, // Ampere
      vol: null, // voltage
    }

   
  }
}

module.exports = Model;