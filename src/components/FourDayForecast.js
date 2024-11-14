import React, { useEffect, useState } from 'react';
import sunnyImage from '../assets/sunny.png';
import cloudyImage from '../assets/cloudy.png';
import rainyImage from '../assets/rainy.png';

function FourDayForecast({ forecast }) {
  const [daysToShow, setDaysToShow] = useState(4);

  useEffect(() => {
    const updateDaysToShow = () => {
      if (window.innerWidth < 600) {
        setDaysToShow(2);
      } else if (window.innerWidth < 900) {
        setDaysToShow(3);
      } else {
        setDaysToShow(4);
      }
    };

    // Set initial days to show and add event listener for resize
    updateDaysToShow();
    window.addEventListener('resize', updateDaysToShow);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateDaysToShow);
    };
  }, []);

  return (
    <div className="flex gap-3 justify-center">
      {forecast.length > 0 ? (
        forecast.slice(0, daysToShow).map((day, index) => {
          // Select image based on description content
          let weatherImage;
          const descriptionLowerCase = day.description.toLowerCase();
          if (descriptionLowerCase.includes('rain')) {
            weatherImage = rainyImage;
          } else if (descriptionLowerCase.includes('clear sky')) {
            weatherImage = sunnyImage;
          } else if (descriptionLowerCase.includes('clouds')) {
            weatherImage = cloudyImage;
          }

          return (
            <div
              key={index}
              className="bg-gradient-to-b from-gray-600 to-gray-400 w-32 h-40 p-3 flex flex-col items-center justify-center text-white rounded-lg shadow-md"
            >
              <p className="font-semibold text-sm">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              {weatherImage && <img src={weatherImage} alt={day.description} className="w-10 h-10 mb-2" />}
              <p className="capitalize text-sm">{day.description}</p>
              <p className="mt-1 text-sm">High: {Math.round(day.high)}°F</p>
              <p className="text-sm">Low: {Math.round(day.low)}°F</p>
            </div>
          );
        })
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}

export default FourDayForecast;
