import React, { useState, useEffect } from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherDetails from './WeatherDetails';
import FourDayForecast from './FourDayForecast';

function Box() {
  const [showAlternate, setShowAlternate] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysToShow, setDaysToShow] = useState(4);

  const latitude = 40.525639;
  const longitude = -89.012779;

  useEffect(() => {
    const updateDaysToShow = () => {
      if (window.innerWidth < 640) {
        setDaysToShow(2);
      } else if (window.innerWidth < 768) {
        setDaysToShow(3);
      } else {
        setDaysToShow(4);
      }
    };

    updateDaysToShow();

    window.addEventListener('resize', updateDaysToShow);
    return () => window.removeEventListener('resize', updateDaysToShow);
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        // Replace 'http://localhost:5000' with your backend server URL if different
        const response = await fetch(`http://localhost:5000/api/weather?latitude=${latitude}&longitude=${longitude}`);
        const data = await response.json();

        // Process the fetched data as needed
        const dailyData = data.forecast.forecastday.map(day => ({
          date: day.date,
          high: day.day.maxtemp_f,
          low: day.day.mintemp_f,
          description: day.day.condition.text,
          weatherMain: day.day.condition.text,
        }));

        setForecast(dailyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);

  const handleToggle = () => {
    setShowAlternate(!showAlternate);
  };

  // Static weather data (replace or integrate with dynamic data as needed)
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
      className="w-2/5 h-2/5 rounded-lg flex flex-col overflow-hidden relative"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #2a2a2a, #4d4d4d)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8)',
      }}
    >
      <div
        className="absolute top-1 right-1 cursor-pointer text-white text-2xl"
        onClick={handleToggle}
      >
        +
      </div>

      {!showAlternate ? (
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
      ) : (
        <div className="flex-1 p-4 text-white flex items-center justify-center">
          {loading ? (
            <p>Loading forecast...</p>
          ) : (
            <FourDayForecast forecast={forecast.slice(0, daysToShow)} />
          )}
        </div>
      )}
    </div>
  );
}

export default Box;
