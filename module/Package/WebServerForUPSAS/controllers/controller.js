const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const net = require('net');
const BiModule = require('../models/BiModule.js');
const webUtil = require('../models/web.util');

const map = require('../public/Map/map');

module.exports = app => {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(
    asyncHandler(async (req, res, next) => {
      req.locals = DU.makeBaseHtml(req, 0);
      const currWeatherCastList = await biModule.getCurrWeatherCast();
      const currWeatherCastInfo = currWeatherCastList.length
        ? currWeatherCastList[0]
        : null;
      const weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
      req.locals.weatherCastInfo = weatherCastInfo;
      next();
    }),
  );

  // Get
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      BU.CLI('control', req.locals);

      const deviceInfoList = [];
      /** @type {nodeInfo[]} */
      const nodeList = await biModule.getTable('v_node_profile', {main_seq: 1});

      const compiledDeviceType = _.template(
        '<option value="<%= nd_target_id %>"> <%= nd_target_name %></option>',
      );

      nodeList.forEach(nodeInfo => {
        const {
          nd_target_id,
          nd_target_name,
          nc_is_sensor,
          node_id,
          node_name,
        } = nodeInfo;
        // 센서가 아닌 장비만 등록
        if (nc_is_sensor === 0) {
          let foundIt = _.find(deviceInfoList, {type: nd_target_id});

          if (_.isEmpty(foundIt)) {
            // const onOffList = ['pump'];
            foundIt = {
              type: nd_target_id,
              list: [],
              template: compiledDeviceType({nd_target_id, nd_target_name}),
              controlType: [],
            };
            deviceInfoList.push(foundIt);
          }
          const compiledDeviceList = _.template(
            '<option value="<%= node_id %>"><%= node_name %></option>',
          );

          foundIt.list.push(compiledDeviceList({node_id, node_name}));
        }
      });

      BU.CLI(deviceInfoList);

      req.locals.hi = 'jhi';
      req.locals.excuteControlList = map.controlList;
      // req.locals.cancelControlList = map.controlList;

      const compiled = _.template(`<option value="<%= controlName %>">
        <%= controlName %>
      </option>`);

      const excuteControlList = [];
      map.controlList.forEach(currentItem => {
        excuteControlList.push(compiled({controlName: currentItem.cmdName}));
      });

      // BU.CLI(excuteControlList);
      const singleControlList = _.pick(map.setInfo.modelInfo, [
        'waterDoor',
        'valve',
        'pump',
      ]);

      req.locals.deviceInfoList = deviceInfoList;
      req.locals.singleControlList = singleControlList;
      req.locals.automaticControlList = excuteControlList;

      // BU.CLI(req.locals);
      // return res.status(200).send(DU.locationJustGoBlank('http://115.23.49.28:7999'));
      return res.render('./controller/index.html', req.locals);
    }),
  );

  return router;
};
