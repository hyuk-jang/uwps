const GetterWeathercast = require('./GetterWeathercast');
const DataStorageManager = require('./DataStorageManager');

class MainControl {
  constructor(params) {}

  /**
   * 메인 소스 들을 컨트롤
   */
  async init() {
    // /** DB에 등록된 기상청 좌표를 기준으로 동네예보를 DB에 자동으로 삽입하고 관련 메소드를 제공하는 클래스  */
    // this.getterWeathercast = new GetterWeathercast();
    // await this.getterWeathercast.init();

    this.dataStorageManager = new DataStorageManager();
    await this.dataStorageManager.init();
  }
}
module.exports = MainControl;
