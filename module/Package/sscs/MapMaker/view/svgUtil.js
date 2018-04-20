'use strict';
try {
  if (require !== undefined && require.main === module) {
    var placeMap = require('../src/defaultMap');
    var SVG = require('svg.js');
    var _ = require('lodash');
    var {BU} = require('base-util-jh');
  } else {
    BU = {CLI: console.log};
  }
} catch (error) {
  BU = {CLI: console.log};
}


var mapFrame = placeMap.drawInfo.frame;
var positionList = placeMap.drawInfo.positionList;

/**
 * 
 * @param {string} svgModelId 
 */
function getSvgGenInfo(svgModelId){
  BU.CLI(mapFrame.svgModelResourceList);
  return _.find(mapFrame.svgModelResourceList, {id:svgModelId});
}

var makeDrawingFrame = function(domId){
  var draw = SVG(domId).size(mapFrame.mapSize.width, mapFrame.mapSize.height);
  var rect = draw.rect(130, 100).move(200, 50).fill('red');
};

var drawingSvg = function(){

};


var test111 = function(){
  console.log('TT');
};







// if (SVG.supported) {
//   var draw = SVG('drawing').size(300, 300);
//   var rect = draw.rect(100, 100).move(100, 50).fill('#f06');
// } else {
//   alert('SVG not supported');
// }

// var test =  getSvgGenInfo('salternLine_001');

// BU.CLI(test);


