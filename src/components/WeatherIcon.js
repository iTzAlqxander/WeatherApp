import React from 'react';

import sunImage from '../assets/sunny.png';
import cloudImage from '../assets/cloudy.png';
import rainImage from '../assets/rainy.png';

function WeatherIcon({ weatherCondition }) {
  let imageSrc;
  switch (weatherCondition) {
    case 'sunny':
      imageSrc = sunImage;
      break;
    case 'cloudy':
      imageSrc = cloudImage;
      break;
    case 'rainy':
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
          className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52"
        />
      ) : (
        <p>No data</p>
      )}
    </div>
  );
}

export default WeatherIcon;
