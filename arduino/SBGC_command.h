/* 
  SimpleBGC Serial API  library - definition of commands
  More info: http://www.basecamelectronics.com/serialapi/


  Copyright (c) 2014-2015 Aleksei Moskalenko
  All rights reserved.
  
  See license info in the SBGC.h
*/   

#ifndef  __SBGC_command__
#define  __SBGC_command__

#include <inttypes.h>

// Size of header and checksums
#define SBGC_CMD_NON_PAYLOAD_BYTES 5
// Max. size of a command after packing to bytes
#define SBGC_CMD_MAX_BYTES 255
// Max. size of a payload data
#define SBGC_CMD_DATA_SIZE (SBGC_CMD_MAX_BYTES - SBGC_CMD_NON_PAYLOAD_BYTES)



////////////////////// Command ID definitions ////////////////
#define SBGC_CMD_GET_SERVO_SPEED  77
#define SBGC_CMD_SET_SERVO_SPEED  109
#define SBGC_CMD_SET_SERVO_SPEED_MICRO  110

/// debug and error defintions
#define SBGC_CMD_DEBUG_VARS_INFO_3 253
#define SBGC_CMD_DEBUG_VARS_3  254
#define SBGC_CMD_ERROR  255



#endif //__SBGC_command__
