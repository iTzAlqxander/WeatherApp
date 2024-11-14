import React, { useState, useEffect } from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherDetails from './WeatherDetails';
import FourDayForecast from './FourDayForecast';

function Box() {
  const [showAlternate, setShowAlternate] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysToShow, setDaysToShow] = useState(4);
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
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
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        const groupedData = data.list.reduce((acc, item) => {
          const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
          if (!acc[date]) {
            acc[date] = { temps: [], weather: item.weather[0] };
          }
          acc[date].temps.push(item.main.temp);
          return acc;
        }, {});

        const dailyData = Object.entries(groupedData).map(([date, { temps, weather }]) => {
          const highCelsius = Math.max(...temps);
          const lowCelsius = Math.min(...temps);

          return {
            date,
            high: (highCelsius * 9 / 5) + 32,
            low: (lowCelsius * 9 / 5) + 32,
            description: weather.description,
            weatherMain: weather.main,
          };
        });

        setForecast(dailyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [apiKey]);

  const handleToggle = () => {
    setShowAlternate(!showAlternate);
  };

  //Connect this to the data base
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
        className="absolute top-2 right-2 cursor-pointer text-white text-2xl"
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
