const serialport = require('serialport');
const eventToPromise = require('event-to-promise');

const AbstractDeviceController = require('../AbstractDeviceController');

class SerialDeviceControllerWithParser extends AbstractDeviceController{
  /**
   * Serial Port 객체를 생성하기 위한 설정 정보
   * @param {{port: string, baud_rate: number, parser: {type: string, option: *}}} config {port, baud_rate, raget_name}
   */
  constructor(config) {
    super();
    this.client = {};
    this.port = config.port;
    this.baud_rate = config.baud_rate;
    this.parser = config.parser;
  }

  /**
   * Parser Pipe 를 붙임
   * @param {Object} client SerialPort Client
   */
  settingParser(client){
    let parser = null;
    if (this.parser !== undefined && this.parser.type !== undefined) {
      switch (this.parser.type) {
      case 'delimiterParser':
        var Delimiter = serialport.parsers.Delimiter;
        parser = client.pipe(new Delimiter({
          delimiter: this.parser.option
        }));
        parser.on('data', data => {
          this.notifyData(Buffer.concat([data, this.parser.option]));
        });
        break;
      case 'byteLengthParser':
        var ByteLength = serialport.parsers.ByteLength;
        parser = client.pipe(new ByteLength({
          length: this.parser.option
        }));
        parser.on('data', data => {
          this.notifyData(data);
        });
        break;
      case 'readLineParser':
        var Readline = serialport.parsers.Readline;
        parser = client.pipe(new Readline({
          delimiter: this.parser.option
        }));
        parser.on('data', data => {
          this.notifyData(Buffer.from(data));
        });
        break;
      case 'readyParser':
        var Ready = serialport.parsers.Ready;
        parser = client.pipe(new Ready({
          delimiter: this.parser.option
        }));
        parser.on('data', data => {
          this.notifyData(data);
        });
        break;
      default:
        break;
      }
    }
  }

  async connect() {
    // BU.CLI('connect');
    this.client = new serialport(this.port, {
      baudRate: this.baud_rate,
    });

    this.settingParser(this.client);

    this.client.on('close', err => {
      this.client = {};
      this.notifyClose(err);
    });

    this.client.on('error', error => {
      this.notifyError(error);
    });

    await eventToPromise.multi(this.client, ['open'], ['error', 'close']);
    this.notifyConnect();
    return this.client;
  }
}
module.exports = SerialDeviceControllerWithParser;