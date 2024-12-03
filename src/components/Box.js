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
    timestamp: null,
  });
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [apiData, setApiData] = useState({
    condition: '',
    location: '',
    windSpeed: 0,
    airPressure: 0,
    sunrise: '',
    sunset: '',
    visibility: 0,
    clouds: 0,
    pop: 0,
  });
  const [relativeTime, setRelativeTime] = useState('');
  const wsRef = useRef(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const latitude = 40.525639;
  const longitude = -89.012779;
  const apiKey = '81f4aa6f37ac6e2dd35816e45df4184b';

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
      const now = new Date().getTime();
      if (lastFetchTime && now - lastFetchTime < 300000) {
        console.log('[Box] Using cached weather data');
        return;
      }

      try {
        setLoading(true);
        console.log('[Box] Fetching new weather data');

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
        console.log('[Box] API URL:', url.replace(apiKey, 'HIDDEN_KEY'));

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log('[Box] Weather API response:', JSON.stringify(data, null, 2));

        const current = data.list[0];
        setApiData({
          condition: current.weather[0].description,
          location: `${data.city.name}, ${data.city.country}`,
          temperature: Math.round(current.main.temp),
          humidity: Math.round(current.main.humidity),
          windSpeed: Math.round(current.wind.speed),
          airPressure: Math.round(current.main.pressure),
          sunrise: new Date(data.city.sunrise * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          sunset: new Date(data.city.sunset * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          visibility: current.visibility,
          clouds: current.clouds.all,
          pop: current.pop,
        });

        const forecastData = Object.entries(
          data.list.reduce((acc, item) => {
            const localDate = new Date(item.dt * 1000).toLocaleDateString('en-US', {
              timeZone: 'America/Chicago',
            });

            if (!acc[localDate]) {
              acc[localDate] = [];
            }
            acc[localDate].push(item);
            return acc;
          }, {})
        )
          .map(([date, items]) => {
            const daytimeTemps = items.filter((item) => {
              const hour = new Date(item.dt * 1000).getHours();
              return hour >= 6 && hour <= 18;
            }).map((item) => item.main.temp);

            const nighttimeTemps = items.filter((item) => {
              const hour = new Date(item.dt * 1000).getHours();
              return hour < 6 || hour > 18;
            }).map((item) => item.main.temp);

            const high = Math.max(...daytimeTemps);
            const low = Math.min(...nighttimeTemps);

            return {
              date: new Date(date),
              description: items.find((item) => item.weather[0]).weather[0].description,
              high: high,
              low: low,
              icon: items.find((item) => item.weather[0]).weather[0].icon,
              pop: Math.max(...items.map((item) => item.pop)),
              humidity: Math.round(
                items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length
              ),
              windSpeed: Math.round(
                items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length
              ),
              clouds: Math.round(
                items.reduce((sum, item) => sum + item.clouds.all, 0) / items.length
              ),
            };
          })
          .filter((entry) => {
            const today = new Date();
            const tomorrow = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + 1
            );
            const fourDaysLater = new Date(
              tomorrow.getFullYear(),
              tomorrow.getMonth(),
              tomorrow.getDate() + 4
            );

            const entryDate = new Date(
              entry.date.getFullYear(),
              entry.date.getMonth(),
              entry.date.getDate()
            );
            return entryDate >= tomorrow && entryDate < fourDaysLater;
          });

        console.log('[Box] Processed forecast data:', forecastData);
        setForecast(forecastData);
        setLastFetchTime(now);
        setLoading(false);
      } catch (error) {
        console.error('[Box] Error fetching weather data:', error);
        setLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 60000);
    return () => clearInterval(interval);
  }, [apiKey, latitude, longitude, lastFetchTime]);

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
              timestamp: data.timestamp,
            });
          }
        } catch (error) {
          console.error('[Box] Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.warn('[Box] WebSocket disconnected');
        setConnectionStatus('disconnected');
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

  const handleToggle = () => {
    setShowAlternate(!showAlternate);
  };

  const weatherData = {
    temperature:
      connectionStatus === 'connected' && sensorData.temperature !== null
        ? sensorData.temperature
        : apiData.temperature,
    humidity:
      connectionStatus === 'connected' && sensorData.humidity !== null
        ? sensorData.humidity
        : apiData.humidity,
    description: apiData.condition,
    location: apiData.location,
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[500px] rounded-2xl flex flex-col overflow-hidden relative bg-[#1a1f25] text-white shadow-2xl p-6">
        <div
          className="absolute top-4 right-4 cursor-pointer text-white/70 text-2xl hover:text-white transition-colors"
          onClick={handleToggle}
        >
          {showAlternate ? '×' : '+'}
        </div>

        {!showAlternate ? (
          <div className="flex flex-col h-full">
            <h1 className="text-6xl font-light mb-2">{weatherData.temperature}°F</h1>
            <h2 className="text-2xl font-light text-white/90 capitalize mb-1">
              {weatherData.description}
            </h2>
            <div className="absolute top-4 right-16">
            <WeatherIcon weatherCondition={weatherData.description} />
            </div>
            <p className="text-lg text-white/70 mb-8">{weatherData.location}</p>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-300">💧</span>
                  <span className="text-white/70">Humidity</span>
                </div>
                <p className="text-2xl">{weatherData.humidity}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-300">💨</span>
                  <span className="text-white/70">Wind</span>
                </div>
                <p className="text-2xl">{apiData.windSpeed} MPH</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-300">🌡️</span>
                  <span className="text-white/70">Pressure</span>
                </div>
                <p className="text-2xl">{apiData.airPressure} hPa</p>
              </div>
            </div>
            <div className="space-y-3 text-base">
              <div className="flex justify-between">
                <span className="text-white/70">Visibility</span>
                <span>{(apiData.visibility / 1000).toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Cloud Cover</span>
                <span>{apiData.clouds}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Chance of Rain</span>
                <span>{Math.round(apiData.pop * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Sunrise</span>
                <span>{apiData.sunrise}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Sunset</span>
                <span>{apiData.sunset}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-white/50 text-center">
              Last updated {relativeTime}
            </div>
          </div>
        ) : (
          <FourDayForecast forecast={forecast.slice(0, daysToShow)} />
        )}
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-white/70 text-sm">
          <ConnectionStatus status={connectionStatus} />
        </div>
      </div>
    </div>
  );
}

export default Box;
