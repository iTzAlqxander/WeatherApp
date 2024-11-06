import React from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherDetails from './WeatherDetails';

function Box() {
  const weatherCondition = 'sunny';
  const weatherData = {
    temperature: 15,
    condition: weatherCondition.charAt(0).toUpperCase() + weatherCondition.slice(1),
    location: 'Normal, IL',
    humidity: 68,
    windSpeed: 2,
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
        <div className="w-1/2 h-full flex items-center justify-center">
          <WeatherIcon weatherCondition={weatherCondition} />
        </div>

        <div className="w-1/2 h-full flex items-center justify-center">
          <WeatherDetails
            temperature={weatherData.temperature}
            condition={weatherData.condition}
            location={weatherData.location}
            humidity={weatherData.humidity}
            windSpeed={weatherData.windSpeed}
          />
        </div>
      </div>
    </div>
  );
}

export default Box;
