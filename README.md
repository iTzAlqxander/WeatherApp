/**********************************************************************
  Filename    : Temperature and Humidity Sensor
  Description : Use DHT11 to measure temperature and humidity.Print the result to the serial port.
  Auther      : www.freenove.com
  Modification: 2024/06/19
**********************************************************************/

/**********************************************************************
  Filename    : Temperature and Humidity Sensor
  Description : Use DHT11 to measure temperature and humidity.Print the result to the serial port.
  Auther      : www.freenove.com
  Modification: 2024/06/19
**********************************************************************/
#include "DHTesp.h"

DHTesp dht;
int dhtPin = 13;

void setup() {
  dht.setup(dhtPin, DHTesp::DHT11);
  Serial.begin(115200);          
}

void loop() {
  flag:TempAndHumidity newValues = dht.getTempAndHumidity();
  if (dht.getStatus() != 0) {
    goto flag;               
  }
  Serial.println(" Temperature:" + String(newValues.temperature) + 
  " Humidity:" + String(newValues.humidity));
  delay(2000);
}
