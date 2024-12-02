import React, { useState, useEffect, useRef } from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherDetails from './WeatherDetails';
import FourDayForecast from './FourDayForecast';
import ConnectionStatus from './ConnectionStatus';

function Box() {
  const [showAlternate, setShowAlternate] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysToShow, setDaysToShow] = useState(4);
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    timestamp: null
  });
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [apiData, setApiData] = useState({
    condition: 'Sunny',
    location: 'Normal, IL',
    windSpeed: 2,
    airPressure: 30.15,
    sunrise: null,
    sunset: null,
  });
  const [relativeTime, setRelativeTime] = useState('');
  const wsRef = useRef(null);

  const latitude = 40.525639;
  const longitude = -89.012779;
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

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

        // Extract current weather data from the first item in the list
        if (data.list && data.list.length > 0) {
          const current = data.list[0];
          setApiData({
            condition: current.weather[0].main,
            location: `${data.city.name}, ${data.city.country}`,
            windSpeed: current.wind.speed,
            airPressure: current.main.pressure,
            sunrise: new Date(data.city.sunrise * 1000).toLocaleTimeString(),
            sunset: new Date(data.city.sunset * 1000).toLocaleTimeString(),
          });
        }

        // Process forecast data
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
  }, [apiKey, latitude, longitude]);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log('[Box] Attempting WebSocket connection...');
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Box] WebSocket connected');
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Box] Received WebSocket message:', data);
          
          if (data.type === 'status') {
            console.log('[Box] Status update:', data.status);
            setConnectionStatus(data.status);
          } else if (data.type === 'sensorData') {
            console.log('[Box] Sensor data update:', data);
            setSensorData({
              temperature: data.temperature,
              humidity: data.humidity,
              timestamp: data.timestamp
            });
          }
        } catch (error) {
          console.error('[Box] Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.warn('[Box] WebSocket disconnected');
        setConnectionStatus('disconnected');
        console.log('[Box] Attempting reconnection in 2 seconds...');
        setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = (error) => {
        console.error('[Box] WebSocket error:', error);
        setConnectionStatus('error');
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const updateRelativeTime = () => {
      if (sensorData.timestamp) {
        const now = new Date();
        const updatedTime = new Date(sensorData.timestamp);
        const diffInSeconds = Math.floor((now - updatedTime) / 1000);

        let relative = '';
        if (diffInSeconds < 60) {
          relative = `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60);
          relative = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600);
          relative = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
          const days = Math.floor(diffInSeconds / 86400);
          relative = `${days} day${days !== 1 ? 's' : ''} ago`;
        }

        setRelativeTime(relative);
      }
    };

    // Update immediately and then every minute
    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 60000);
    return () => clearInterval(interval);
  }, [sensorData.timestamp]);

  const handleToggle = () => {
    setShowAlternate(!showAlternate);
  };

  // Combine Arduino sensor data with API data
  const weatherData = {
    temperature: sensorData.temperature, // From Arduino
    condition: apiData.condition, // From API
    location: apiData.location, // From API
    humidity: sensorData.humidity, // From Arduino
    windSpeed: apiData.windSpeed, // From API
    airPressure: apiData.airPressure, // From API
    sunrise: apiData.sunrise, // From API
    sunset: apiData.sunset, // From API
    lastUpdated: relativeTime
  };

  return (
    <>
      <ConnectionStatus status={connectionStatus} />
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
            <div className="w-3/5 h-full flex flex-col items-center justify-center">
              {sensorData.temperature !== null && sensorData.humidity !== null ? (
                <>
                  <WeatherDetails
                    temperature={weatherData.temperature}
                    condition={weatherData.condition}
                    location={weatherData.location}
                    humidity={weatherData.humidity}
                    windSpeed={weatherData.windSpeed}
                    airPressure={weatherData.airPressure}
                  />
                  <div className="mt-2 text-sm text-gray-300">
                    <p>Sunrise: {weatherData.sunrise}</p>
                    <p>Sunset: {weatherData.sunset}</p>
                    <p>Last updated: {weatherData.lastUpdated}</p>
                  </div>
                </>
              ) : (
                <p className="text-white">Loading sensor data...</p>
              )}
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
    </>
  );
}

export default Box;
