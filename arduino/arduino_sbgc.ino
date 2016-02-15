//<base Arduino folder>\hardware\arduino\avr\cores\arduino\HardwareSerial.h
//
//Change:
//
//__#define SERIAL_TX_BUFFER_SIZE 64
//__#define SERIAL_RX_BUFFER_SIZE 64
//
//To:
//
//__#define SERIAL_TX_BUFFER_SIZE 150 or 256
//__#define SERIAL_RX_BUFFER_SIZE 150 or 256


#include <inttypes.h>
#include "SBGC.h"
#include <Streaming.h>
#include <Servo.h>

#define MAX_WAIT_TIME_MS 2000  // time to wait for incoming commands to be in CONNECTED state


static uint16_t cur_time_ms, last_cmd_time_ms;
static uint8_t is_connected = 0;

/* Defines serial port routines required for SBGC_parser, here */
class ArduinoComObj : public SBGC_ComObj {
  Stream *serial;
  public:
  inline void init(Stream *s) {
    serial = s;
  }

  virtual uint16_t getBytesAvailable() {
    return serial->available();
  }
  
  virtual uint8_t readByte() {
    return serial->read();
  }
  
  virtual void writeByte(uint8_t b) {
    serial->write(b);
  }
  
  // Arduino com port is not buffered, so empty space is unknown.
  virtual uint16_t getOutEmptySpace() {
    return 0xFFFF;
  }

};


/* Global variables */
SBGC_Parser sbgc_parser;  // SBGC command parser. Define one for each port.
ArduinoComObj com_obj; // COM-port wrapper required for parser
HardwareSerial &serial = Serial;

// servo
Servo servo;  // create servo object to control a servo
int16_t servoNeutralPos = 0;
int16_t servoPos = 0;

void setup() {
  // turn the serial protocol on
  serial.begin(115200);
  com_obj.init(&serial);
  sbgc_parser.init(&com_obj);

  // attach our servo to pin 3
  servo.attach(3);
  servoNeutralPos = servo.read();
  servoPos = servoNeutralPos;
}

void loop() {
  // update our servo pos
//  servoPos = servo.read();
  
  // put your main code here, to run repeatedly:
  // serial.println(String("Servo POS: ") + servoPos + String(" - Neutral POS: ") + servoNeutralPos);

  // only need updates once a second
  // delay(1000);
  // keep track of when we processed commands
  cur_time_ms = millis();

  // process this as frequently as possible to avoid overflowing the buffer
  process_in_queue();
}

// called once on a connection established
void set_connected() {
  is_connected = 1;
}

// process incoming commands. Call it as frequently as possible, to prevent overrun of serial input buffer.
void process_in_queue() {
  while(sbgc_parser.read_cmd()) {
    
    SerialCommand &cmd = sbgc_parser.in_cmd;
    last_cmd_time_ms = cur_time_ms;
    if(!is_connected) set_connected();
    
    uint8_t error = 0;
    
    switch(cmd.id) {

    // return back our current position and neutral position
    case SBGC_CMD_GET_SERVO_SPEED:
        {
        // update our servo pos
        servoPos = servo.read();
  
        // put your main code here, to run repeatedly:
        SerialCommand cmdOut;
        
        cmdOut.init(SBGC_CMD_GET_SERVO_SPEED);
      
        // are servo position
        cmdOut.writeByte( lowByte(servoPos) );
        cmdOut.writeByte( highByte(servoPos) );
      
        // servo neutral pos
        cmdOut.writeByte( lowByte(servoNeutralPos) );
        cmdOut.writeByte( highByte(servoNeutralPos) );
      
        sbgc_parser.send_cmd(cmdOut);
        }
        break;

    case SBGC_CMD_SET_SERVO_SPEED:
        {
        // get our desired speed
        int desiredPos = cmd.readWord();
  
        // for testing purposes
        // set servoPos
        //servoPos = desiredPos;
        servo.write(desiredPos);
        }

        break;

    case SBGC_CMD_SET_SERVO_SPEED_MICRO:
        {
        // get our desired speed
        int desiredPos = cmd.readWord();
  
        // for testing purposes
        // set servoPos
        //servoPos = desiredPos;
        servo.writeMicroseconds(desiredPos);
        }

        break;

    }
  }
  
  // If no commands for a long time, set connected state to false
  if(is_connected && (uint16_t)(cur_time_ms - last_cmd_time_ms) > MAX_WAIT_TIME_MS) {
    is_connected = 0;
  }
}



