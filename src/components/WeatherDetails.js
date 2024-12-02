import React from 'react';

import humidityIcon from '../assets/humidity.png';
import windIcon from '../assets/wind.png';
import pressureIcon from '../assets/pressure.png';

function WeatherDetails({ temperature, condition, location, humidity, windSpeed, airPressure }) {
  return (
    <div className="text-white flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">{temperature}°F</h1>
      <p className="text-lg md:text-xl">{condition}</p>
      <p className="text-md md:text-lg">{location}</p>
      <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mt-2">
        <div className="flex items-center space-x-2">
          <img src={humidityIcon} alt="Humidity Icon" className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-sm md:text-md">{humidity}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <img src={windIcon} alt="Wind Icon" className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-sm md:text-md">{windSpeed} MPH</span>
        </div>
        <div className="flex items-center space-x-2">
          <img src={pressureIcon} alt="Air Pressure Icon" className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-sm md:text-md">{airPressure} hPa</span>
        </div>
      </div>
    </div>
  );
}

export default WeatherDetails;
