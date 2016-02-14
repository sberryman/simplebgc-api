var AC = require('./definitions');
var _ = require('lodash');
var SerialPort = require('serialport');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var defaults = {
    port: '/dev/cu.usbserial-A702U0PY',
    baudRate: 115200,
    bufferSize: 150
};
var serialDefaults = {
    cmdId: AC.CMD_GET_SERVO_SPEED
};

var SerialCommand = function (options) {
    // merge options and defaults
    _.defaults(options, serialDefaults);

    // internal properties
    var pos = 0;
    var len = 0;
    var buf = new Buffer(AC.CMD_MAX_BYTES);

    // internal methods
    /* Check if limit reached after reading data buffer */
    var checkLimit = function () {
        return len === pos;
    };
    var getBytesAvailable = function () {
        return len - pos;
    };
};


function Library (options) {
    // merge options and defaults
    _.defaults(options, defaults);

    // variables
    var self = this;
    self.AC = AC;
    self.serialPort = null;
    self.events = new EventEmitter();

    var internals = self.internals = {
        AC: AC,
        serialPort: null,
        events: self.events,
        _this: self
    };

    // internal methods
    var _init = function() {
        // open the port
        internals.serialPort = new SerialPort.SerialPort(options.port, {
            baudRate: options.baudRate,
            parser: SerialPort.parsers.raw,
            bufferSize: options.bufferSize
        }, false);


        // event listeners
        internals.serialPort.on('data', function (data) {
            // console.log('Serial Port Data (' + data.length + '): ', util.inspect(data));
            if (data.length < 4) {
                return;
            }

            // read the header!
            var header = {
                character: data.toString('ascii', 0, 1),
                cmdId: data.readUInt8(1),
                size: data.readUInt8(2),
                checksum: data.readUInt8(3)
            };

            // check the validity of the header
            if (!header ||
                !_.isNumber(header.cmdId) ||
                !_.isNumber(header.size) ||
                !_.isNumber(header.checksum)) {
                throw new Error('Invalid payload!');
            }

            // ensure the checksum is accurate
            if (header.cmdId + header.size !== header.checksum) {
                throw new Error('Invalid checksum!');
            }

            if (data.length < (header.size + AC.CMD_NON_PAYLOAD_BYTES)) {
                throw new Error('Incomplete payload!');
            }

            // grab the body
            var body = data.slice(4, header.size + 4);
            var bodyChecksum = data.readUInt8(data.length - 1);

            // debug data!
            // console.log('Header: ' + util.inspect(header));
            // console.log('Body: ' + util.inspect(body) + ' (checksum: ' + bodyChecksum + ', length: ' + body.length + ')');

            // do we have it?
            if (!_.isObject(incomingDataParser[header.cmdId])) {
                return incomingDataParser['not-implemented'];
            }

            // guess so!
            return incomingDataParser[header.cmdId].parse(body);
        });
        internals.serialPort.on('close', function () {

            // console.log('Serial Port Closed!');
            self.events.emit('close');
        });
        internals.serialPort.on('error', function (err) {

            // re-emit this error
            self.events.emit('error', err);
        });

        // open the connection!
        process.nextTick(function () {

            internals.serialPort.open(function (err) {

                // do we have an error?
                if (err) {
                    return self.events.emit('error', err);
                }

                // success, connection is open
                self.events.emit('open');
            });

        });
    };

    // parse incoming data
    // create events using an internal event emitter
    // that clients can subscibe to
    // key = cmdId
    // val = {
    //     event: 'string',
    //     parse: function(buffer, options)
    // }
    // will emit event when parsed
    var incomingDataParserDefaultOptions = {
        emit: true
    };
    var incomingDataParser = {
        'not-implemented': {
            event: 'not-implemented',
            parse: function (buffer, pOpts) {
                throw new Error('Not yet implemented...');
            }
        }
    };

    // receive real-time data!
    incomingDataParser[AC.CMD_GET_SERVO_SPEED] = {
        event: 'servo_pos',
        parse: function (buffer, pOpts) {
            // apply our defaults
            pOpts = _.defaults(pOpts || {}, incomingDataParserDefaultOptions);

            // parse the data
            var result = {
                // bit0 
                servoPos: buffer.readInt16LE(0),

                // the neutral position
                servoNeutralPos: buffer.readInt16LE(2)
            };

            // emit?
            if (_.isObject(pOpts) && pOpts.emit === true) {
                // console.log('SBGC_CMD_GET_SERVO_SPEED: ', result);
                self.events.emit(incomingDataParser[AC.CMD_GET_SERVO_SPEED].event, result);
            }

            // return the result
            return result;
        }
    };

    // error on executing previous command
    incomingDataParser[AC.CMD_ERROR] = {
        event: 'cmd_error',
        parse: function (buffer) {
            // parse the buffer
            var result = {
                code: buffer.readUInt8(0),

                data: new Buffer(buffer.length - 1)
            };

            // copy data
            buffer.copy(result.data, 0, 1, 4);

            // emit?
            if (_.isObject(pOpts) && pOpts.emit === true) {
                console.log('CMD_ERROR: ', result);
                self.events.emit(incomingDataParser[AC.CMD_ERROR].event, result);
            }

            // return our result
            return result;
        }
    };

    // public methods
    internals.sendCommand = function (cmdId, data, next) {
        // default to a size of 1? (seems to work)
        var size = (typeof data !== 'undefined' && data !== null && data.length) ? data.length || 1 : 1;

        if (size <= (AC.CMD_MAX_BYTES - AC.CMD_NON_PAYLOAD_BYTES)) {

            // if (wait || com_obj->getOutEmptySpace() >= size + CMD_NON_PAYLOAD_BYTES) {
            // } else {
            //     return AC.PARSER_ERROR_BUFFER_IS_FULL;
            // }

            // create our buffer
            var commandBuffer = new Buffer(AC.CMD_DATA_SIZE);

            // header!
            
            // // protocol-specific start marker SBGC.SBGC_CMD_START_BYTE
            commandBuffer.write(AC.CMD_START_BYTE, 0, 1, 'ascii');

            // command id
            commandBuffer.writeUInt8(cmdId, 1);

            // data body length
            commandBuffer.writeUInt8(size, 2);

            // header checksum
            commandBuffer.writeUInt8(cmdId + size, 3);

            // init checksum
            var checksum = 0;

            // data!
            if (typeof data !== 'undefined' && data !== null && data.length > 0) {

                // write it!
                for (var i = 0; i < size; i++) {
                    // console.log('Writing byte: %s - test: %s', data[i], parseInt(data[i], 16))

                    // com_obj->writeByte(((uint8_t*)data)[i]);
                    // commandBuffer.writeUInt8(parseInt(data[i], 16), i + 4);
                    // commandBuffer.writeInt16LE(data[i], AC.CMD_NON_PAYLOAD_BYTES + i)

                    // update the checksum
                    // SerialCommand::update_checksum(checksum, ((uint8_t*)data)[i]);
                    checksum += data[i];
                    // checksum += parseInt(data[i], 16);
                    // (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
                }

                // does this work?
                data.copy(commandBuffer, AC.CMD_NON_PAYLOAD_BYTES - 1, 0, data.length)
                // commandBuffer.write(data);

            } else {
                // write somethind useless :) (it is useless to me as of 2016-01-25)
                commandBuffer[4] = 0x01;

                // checksum force?
                checksum = 1;
            }

            // trim the buffer down
            commandBuffer = commandBuffer.slice(0, AC.CMD_NON_PAYLOAD_BYTES + size);

            // data checksum
            // commandBuffer.writeUInt8(checksum, 4 + size);
            // commandBuffer[5] = 0x01;
            // commandBuffer.writeUInt8(1, 6);
            // console.log('checksum: %s (mod %s)', checksum, checksum % 256)
            commandBuffer.writeUInt8(checksum % 256, commandBuffer.length - 1);

            // send the buffer!
            // console.log('Writing: ', commandBuffer)
            internals.serialPort.write(commandBuffer, function () {

                internals.serialPort.drain(next || _.noop);
            });

        } else {

            console.log('PARSER_ERROR_WRONG_CMD_SIZE');
            return AC.PARSER_ERROR_WRONG_CMD_SIZE;
        }
    };
    internals.getServoSpeed = function() {

        internals.sendCommand(AC.CMD_GET_SERVO_SPEED, null);
    };
    internals.setServoSpeed = function(speed) {

        // create a buffer for our data
        var speedBuffer = new Buffer(2);

        // very simple
        speedBuffer.writeInt16LE(speed, 0);

        // fire!
        internals.sendCommand(AC.CMD_SET_SERVO_SPEED, speedBuffer);
    };
    internals.setServoSpeedMicro = function(speed) {

        // create a buffer for our data
        var speedBuffer = new Buffer(2);

        // very simple
        speedBuffer.writeInt16LE(speed, 0);

        // fire!
        internals.sendCommand(AC.CMD_SET_SERVO_SPEED_MICRO, speedBuffer);
    };

    // open that connection!
    _init();

    // return our internals
    return internals;
};


exports.register = function (server, options, next) {

    options = options || {};

    // log what we are connecting to
    server.log([ 'arduino-lib', 'info' ], 'connecting to port: %s', options.port || defaults.port);

    // create a new library (this will init the connection!)
    var library = new Library(options);

    // event listeners
    library.events.on('open', function (){

        server.log([ 'arduino-lib', 'info' ], 'arduino serial connection created');

        // ready!
        next();
    });
    library.events.on('error', function (err) {

        // sad times
        console.log('arduino-lib: ', err);
        server.log([ 'arduino-lib', 'error' ], 'Serial connection failed', err);
        throw err;
    });

    // expose the library
    server.expose('client', library);
};

exports.register.attributes = {
    pkg: require('./package.json'),
    multiple: false
};
