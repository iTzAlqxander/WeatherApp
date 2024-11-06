import React from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherDetails from './WeatherDetails';

function Box() {
  const weatherData = {
    temperature: 58,
    condition: 'Sunny',
    location: 'Normal, IL',
    humidity: 68,
    windSpeed: 2,
    airPressure: 30.15,
  };

  return (
    <div
      className="w-2/5 h-2/5 rounded-lg flex flex-col overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #1a1a1a, #333333)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8)',
      }}
    >
      <div className="p-4 text-center">
        <h1></h1>
      </div>

      <div className="flex flex-1">
        <div className="w-2/5 h-full flex items-center justify-center">
          <WeatherIcon weatherCondition={weatherData.condition} />
        </div>

        <div className="w-3/5 h-full flex items-center justify-center">
          <WeatherDetails
            temperature={weatherData.temperature}
            condition={weatherData.condition}
            location={weatherData.location}
            humidity={weatherData.humidity}
            windSpeed={weatherData.windSpeed}
            airPressure={weatherData.airPressure}
          />
        </div>
      </div>
    </div>
  );
}

export default Box;
