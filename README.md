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


IT225 WeatherApp Project

/**********************************************************************
  Filename    : Temperature and Humidity Sensor
  Description : Use DHT11 to measure temperature and humidity.Print the result to the serial port.
  Auther      : www.freenove.com
  Modification: 2024/06/19
**********************************************************************/

#include "DHT.h"

// Pin configuration
#define DHTPIN 13
#define DHTTYPE DHT11

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("DHT11 Sensor Test");
}

void loop() {
  float humidity = dht.readHumidity();
  float tempC = dht.readTemperature();
  float tempF = dht.readTemperature(true);

  // Check if readings failed
  if (isnan(humidity) || isnan(tempC) || isnan(tempF)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print("%  |  ");
  
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.print("°C / ");
  Serial.print(tempF);
  Serial.println("°F");

  delay(2000); // Wait 2 seconds between measurements
}
