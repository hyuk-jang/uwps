const serialport = require('serialport');

const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');
/** Class Serial Port 접속 클라이언트 클래스 */
class SerialClient extends EventEmitter {
  /**
   * Serial Port 객체를 생성하기 위한 설정 정보
   * @param {{port: string, baud_rate: number, target_name: string, parser: {type: string, option: *}}} config {port, baud_rate, raget_name}
   */
  constructor(config) {
    super();
    this.client = {};
    this.port = config.port;
    this.baud_rate = config.baud_rate;
    this.target_name = config.target_name;
    this.parser = config.parser;
    this.hasInit = false;
  }

  _init(client) {
    // BU.CLI('초기화 실행', this.parser)
    if (this.parser !== undefined && this.parser.type !== undefined) {
      this.hasInit = true;
      let parser = null;
      switch (this.parser.type) {
        case 'delimiterParser':
          // BU.CLI('delimiterParser', this.parser)
          const Delimiter = serialport.parsers.Delimiter;
          parser = client.pipe(new Delimiter({
            delimiter: this.parser.option
          }));
          parser.on('data', data => {
            this._onData(Buffer.concat([data, this.parser.option]))
          })
          break;
        case 'byteLengthParser':
          const ByteLength = serialport.parsers.ByteLength;
          parser = client.pipe(new ByteLength({
            length: this.parser.option
          }));
          parser.on('data', data => {
            this._onData(data)
          })
          break;
        case 'readLineParser':
          const Readline = serialport.parsers.Readline;
          parser = client.pipe(new Readline({
            delimiter: this.parser.option
          }));
          parser.on('data', data => {
            this._onData(data)
          })
          break;
        case 'readyParser':
          const Ready = serialport.parsers.Ready;
          parser = client.pipe(new Ready({
            delimiter: this.parser.option
          }));
          parser.on('data', data => {
            this._onData(data)
          })
          break;
        default:
          break;
      }

    }
  }

  _onData(bufferData) {
    return this.emit('data', bufferData);
  }

  _onClose() {
    return this.emit('close');
  }

  _onError(err) {
    return this.emit('error', err);
  }

  async connect() {
    this.client = new serialport(this.port, {
      baudRate: this.baud_rate,
    });

    this._init(this.client)

    this.client.on('data', bufferData => {
      if (!this.hasInit) {
        this._onData(bufferData);
      }
    });

    this.client.on('close', err => {
      this.client = {};
      this._onClose(err);
    });

    this.client.on('error', error => {
      this._onError(error);
    });

    await eventToPromise.multi(this.client, ['open'], ['error', 'close']);
    return this.client;
  }
}
module.exports = SerialClient;