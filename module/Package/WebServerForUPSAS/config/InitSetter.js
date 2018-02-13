const crypto = require('crypto');
const request = require('request');
const os = require('os');

class InitSetter {
  constructor(initConfig = {
    cryptoInfo: {
      prime_key,
      alice,
      aliceBobSecret,
      bobPub,
      alicePub
    },
    dbInfo: {
      host,
      port,
      user,
      password,
      database
    },
    identificationNum,
    hasExchangeKey, // exchangeKey
    hasMapDownload, // map download 
    webServerUrl,
    controllerInfo,
    mapInfo
  }) {
    this.config = initConfig;

    // 객체 생성시 암호화 알고리즘 초기화
    this.generateAlice();
  }

  // 최초 암호화 알고리즘 설정
  generateAlice() {
    // crypto 설정
    let prime_key = this.config.cryptoInfo.prime_key;
    let alice = crypto.createDiffieHellman(new Buffer(prime_key, 'hex'));
    alice.generateKeys();
    this.config.cryptoInfo.alicePub = alice.getPublicKey();
    this.config.cryptoInfo.alice = alice;

    // DB Password Load
    // this.config.dbInfo.password = process.env.SALTERN_PW || 'test';
  }



  // 통합서버와 키교환 
  exchangeInfo(callback) {
    // 통합 서버와 실제로 키 교환을 할 경우
    if (this.config.hasExchangeKey) {
      // BU.CLI('exchangeKey')
      let exchangeUrl = `${this.config.webServerUrl}/api/exchange-key/${this.config.identificationNum}`;
      // BU.CLI('exchangeUrl',exchangeUrl)
      let addresses = [];
      let interfaces = os.networkInterfaces();
      for (let k in interfaces) {
        for (let k2 in interfaces[k]) {
          let address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
          }
        }
      }

      // 키 교환 수행
      request.post(exchangeUrl, {
        json: {
          ip: addresses[0],
          pub_key: this.config.cryptoInfo.alicePub
        }
      }, (error, response, body) => {
        BU.CLI(error);
        // 에러가 발생할 경우 기존에 저장된 Controller File 정보를 Load
        if (error) {
          BU.errorLog('init', 'exchangeKey Error', error);
          return this._loadInitFile(callback);
        } else if (!(response.statusCode >= 200 && response.statusCode < 300)) {
          BU.errorLog('init', 'exchangeKey Error', 'occur error 200 ~ 300');
          return this._loadInitFile(callback);
        } else {
          // 설정 변수 업데이트
          this.config.cryptoInfo.aliceBobSecret = this.config.cryptoInfo.alice.computeSecret(new Buffer(body.bobPub));
          // 컨트롤러 정보 업데이트
          this.config.controllerInfo = body;
          // BU.CLI(this.controllerInfo)
          BU.writeFile('./public/controllerInfo.conf', body, 'w', (err, result) => {
            return callback(err);
          });
        }
      });
    } else { // 키 교환을 하지 않을 경우 기존 파일 Load
      return this._loadInitFile(callback);
    }

  }

  // 저장된 init File(예전에 저장된 컨트롤러 기본 정보) Load
  _loadInitFile(callback) {
    BU.readFile('./public/controllerInfo.conf', 'utf-8', (err, fileContents) => {
      if (err) {
        return callback(err);
      } else {
        this.config.controllerInfo = JSON.parse(fileContents);
        return callback(null, this.controllerInfo);
      }
    });
  }

  // Map 초기화
  downloadMap(callback) {
    // 통합 서버에서 실제로 Map Download 할 경우
    if (this.config.hasMapDownload) {
      BU.CLI('Real downloadMap');
      let downloadUrl = this.config.webServerUrl + this.controllerInfo.url;
      request.get(downloadUrl, (error, response, body) => {
        if (error) {
          return callback(error);
        } else {
          try {
            this.config.mapInfo = JSON.parse(body);
            // 맵을 다운로드 받아 2개로 저장
            BU.writeFile(`./public/map/${this.controllerInfo.filename}`, body, 'w', err => {
              if (err) {
                return callback(err);
              } else {
                BU.writeFile('./public/map/map.json', body, 'w', err => {
                  return callback(null, this.map);
                });
              }
            });
          } catch (error) {
            BU.errorLog('init', 'Map File 형식이 이상합니다.', error);
            return process.exit();
          }
        }
      });
    } else {
      BU.CLI('Dev downloadMap');
      this.config.mapInfo = require('../public/map/map.json');
      return callback(null, this.map);
    }

  }



  // 최신 맵 버전 체크. Controller 정보에 명시되어 있는 File이 존재한다면 True 반환, 아니라면 False 반환
  checkMapVersion(callback) {
    BU.searchDirectory('./public/map', (err, fileList) => {
      if (_.contains(fileList, this.controllerInfo.map_ver)) {
        return callback(err, false);
      } else {
        return callback(err, true);
      }
    });
  }


  // workers config.js 수정
  setterWorkersSetting(workersConfig) {
    // console.log(workersConfig)
    // Push Port 수정
    workersConfig.SocketServer.PushServer.current.port = this.config.controllerInfo.push_port;
  }



  get initConfig() {
    return this.config;
  }

  get controllerInfo() {
    return this.config.controllerInfo;
  }

  get mapInfo() {
    return {
      mapImg: this.originalMap.MAP,
      mapRelation: this.originalMap.RELATION,
      mapSetInfo: this.originalMap.SETINFO,
      mapControl: this.originalMap.CONTROL,
      mapText: '',
      mapFileName: this.controllerInfo.filename
    };
  }

  get originalMap() {
    return this.config.mapInfo;
  }

  get dbInfo() {
    return this.config.dbInfo;
  }

  get cryptoInfo() {
    return this.config.cryptoInfo;
  }

  get aliceBobSecret() {
    return this.config.cryptoInfo.aliceBobSecret;
  }

  get webPort() {
    return this.config.controllerInfo.web_port;
  }
  get pushPort() {
    return this.config.controllerInfo.push_port;
  }

  get cmdPort() {
    return this.config.controllerInfo.cmd_port;
  }

}
module.exports = InitSetter;