var defs = {
    ERR_CMD_SIZE: 1,
    ERR_WRONG_PARAMS: 2,
    ERR_CRYPTO: 4,
    ERR_UNKNOWN_COMMAND: 6,
    SYS_ERR_SERIAL: 32,

    CMD_NON_PAYLOAD_BYTES: 5,
    CMD_MAX_BYTES: 255,
    CMD_DATA_SIZE: 250,
    CMD_GET_SERVO_SPEED: 77,
    CMD_SET_SERVO_SPEED: 109,
    CMD_SET_SERVO_SPEED_MICRO: 110,
    CMD_START_BYTE: '>',

    PARSER_NO_ERROR: 0,
    PARSER_ERROR_PROTOCOL: 1,
    PARSER_ERROR_WRONG_CMD_SIZE: 2,
    PARSER_ERROR_BUFFER_IS_FULL: 3,
    PARSER_ERROR_WRONG_DATA_SIZE: 4
};

module.exports = defs;