import React, { useState, useEffect } from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherDetails from './WeatherDetails';
import sunnyImage from '../assets/sunny.png';
import cloudyImage from '../assets/cloudy.png';
import rainyImage from '../assets/rainy.png';

function Box() {
  const [showAlternate, setShowAlternate] = useState(false);
  const [forecast, setForecast] = useState([]);
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
  const latitude = 40.525639;
  const longitude = -89.012779;

  const handleToggle = () => {
    setShowAlternate(!showAlternate);
  };

  useEffect(() => {
    if (showAlternate) {
      const fetchWeatherData = async () => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
          );
          const data = await response.json();

          // Group data by date and find daily high and low temperatures
          const groupedData = data.list.reduce((acc, item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
            if (!acc[date]) {
              acc[date] = { temps: [], weather: item.weather[0] };
            }
            acc[date].temps.push(item.main.temp);
            return acc;
          }, {});

          const dailyData = Object.entries(groupedData).slice(0, 5).map(([date, { temps, weather }]) => {
            const highCelsius = Math.max(...temps);
            const lowCelsius = Math.min(...temps);

            return {
              date,
              high: (highCelsius * 9/5) + 32, // Convert to Fahrenheit
              low: (lowCelsius * 9/5) + 32, // Convert to Fahrenheit
              description: weather.description,
              weatherMain: weather.main,
            };
          });

          setForecast(dailyData);
        } catch (error) {
          console.error('Error fetching weather data:', error);
        }
      };

      fetchWeatherData();
    }
  }, [showAlternate, apiKey]);

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
        backgroundImage: 'linear-gradient(to bottom, #1a1a1a, #333333)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Plus button */}
      <div
        className="absolute top-2 right-2 cursor-pointer text-white text-2xl"
        onClick={handleToggle}
      >
        +
      </div>

      {!showAlternate ? (
        // Original content
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
        // 5-day weather forecast
        <div className="flex-1 p-4 text-white flex items-center justify-center">
          <div className="flex gap-2 justify-center">
            {forecast.length > 0 ? (
              forecast.map((day, index) => {
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
                    className="bg-gradient-to-b from-blue-500 to-blue-300 w-28 h-36 p-2 flex flex-col items-center justify-center text-black rounded-lg shadow-lg"
                  >
                    <p className="font-semibold text-xs">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    {/* Display the selected weather image */}
                    {weatherImage && <img src={weatherImage} alt={day.description} className="w-8 h-8 mb-1" />}
                    <p className="capitalize text-xs">{day.description}</p>
                    <p className="mt-1 text-xs">High: {Math.round(day.high)}°F</p>
                    <p className="text-xs">Low: {Math.round(day.low)}°F</p>
                  </div>
                );
              })
            ) : (
              <p>Loading weather data...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Box;
