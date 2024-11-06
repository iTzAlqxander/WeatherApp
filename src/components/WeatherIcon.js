import React from 'react';

import sunImage from '../assets/sunny.png';
import cloudImage from '../assets/cloudy.png';
import rainImage from '../assets/rainy.png';

function WeatherIcon({ weatherCondition }) {
  let imageSrc;
  switch (weatherCondition) {
    case 'Sunny':
      imageSrc = sunImage;
      break;
    case 'Cloudy':
      imageSrc = cloudImage;
      break;
    case 'Rainy':
      imageSrc = rainImage;
      break;
    default:
      imageSrc = null;
      break;
  }

  return (
    <div className="flex justify-center items-center">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={weatherCondition}
          className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48"
        />
      ) : (
        <p>No data</p>
      )}
    </div>
  );
}

export default WeatherIcon;
