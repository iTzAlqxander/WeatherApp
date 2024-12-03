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
  const apiKey = '81f4aa6f37ac6e2dd35816e45df4184b'; // i dont give a fuck im hardcoding this shit bro

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

        if (!data.list || data.list.length === 0) {
          throw new Error('Invalid API response format');
        }

        const current = data.list[0];
        const newApiData = {
          condition: current.weather[0].description,
          location: `${data.city.name}, ${data.city.country}`,
          windSpeed: Math.round(current.wind.speed),
          airPressure: Math.round(current.main.pressure),
          sunrise: new Date(data.city.sunrise * 1000).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          sunset: new Date(data.city.sunset * 1000).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          visibility: current.visibility,
          clouds: current.clouds.all,
          pop: current.pop,
        };

        console.log('[Box] Processed API data:', newApiData);
        
        setApiData(newApiData);
        setLastFetchTime(now);
        setLoading(false);

        // Process forecast data
        // Group forecast data by day
const groupedData = data.list.reduce((acc, item) => {
  const date = new Date(item.dt * 1000).toISOString().split('T')[0]; // Extract date in 'YYYY-MM-DD' format
  if (!acc[date]) {
    acc[date] = [];
  }
  acc[date].push(item);
  return acc;
}, {});

// Process the grouped data to get daily forecasts
// Function to process forecast data for better high/low accuracy
const forecastData = Object.entries(
  data.list.reduce((acc, item) => {
    // Convert UTC timestamp to CST
    const localDate = new Date(item.dt * 1000).toLocaleDateString('en-US', {
      timeZone: 'America/Chicago', // CST Time Zone
    });

    if (!acc[localDate]) {
      acc[localDate] = [];
    }
    acc[localDate].push(item);
    return acc;
  }, {})
)
  // Map over grouped data
  .map(([date, items]) => {
    const daytimeTemps = items.filter(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 6 && hour <= 18;
    }).map(item => item.main.temp);

    const nighttimeTemps = items.filter(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour < 6 || hour > 18;
    }).map(item => item.main.temp);

    const high = Math.max(...daytimeTemps);
    const low = Math.min(...nighttimeTemps);

    return {
      date: new Date(date), // Corrected date in CST
      description: items.find(item => item.weather[0]).weather[0].description,
      high: high,
      low: low,
      icon: items.find(item => item.weather[0]).weather[0].icon,
      pop: Math.max(...items.map(item => item.pop)),
      humidity: Math.round(items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length),
      windSpeed: Math.round(items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length),
      clouds: Math.round(items.reduce((sum, item) => sum + item.clouds.all, 0) / items.length)
    };
  })
  // Filter for dates starting from tomorrow and covering the next 4 days
  .filter(entry => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Start of tomorrow
    const fourDaysLater = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 4); // 4 days after tomorrow

    const entryDate = new Date(entry.date.getFullYear(), entry.date.getMonth(), entry.date.getDate()); // Normalize date
    return entryDate >= tomorrow && entryDate < fourDaysLater;
  });




        console.log('[Box] Processed forecast data:', forecastData);

        setForecast(forecastData);
      } catch (error) {
        console.error('[Box] Error fetching weather data:', error);
        if (error.response) {
          console.error('[Box] Error response:', await error.response.text());
        }
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
        const now = Date.now();
        const updatedTime = new Date(sensorData.timestamp).getTime();
        const diffInSeconds = Math.floor((now - updatedTime) / 1000);

        let relative = '';
        if (diffInSeconds < 2.5) {
          relative = 'just now';
        } else if (diffInSeconds < 60) {
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

        console.log('[Box] Timestamp update:', {
          now,
          updatedTime,
          diffInSeconds,
          relative
        });

        setRelativeTime(relative);
      }
    };

    // Update immediately and then every second for more accurate updates
    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 1000);
    return () => clearInterval(interval);
  }, [sensorData.timestamp]);

  const handleToggle = () => {
    setShowAlternate(!showAlternate);
  };

  // Combine Arduino sensor data with API data
  const weatherData = {
    temperature: sensorData.temperature, // From Arduino
    description: apiData.condition, // This is now the weather description
    location: apiData.location, // From API
    humidity: sensorData.humidity, // From Arduino
    windSpeed: apiData.windSpeed, // From API
    airPressure: apiData.airPressure, // From API
    sunrise: apiData.sunrise, // From API
    sunset: apiData.sunset, // From API
    visibility: apiData.visibility, // From API
    clouds: apiData.clouds, // From API
    pop: apiData.pop, // From API
    lastUpdated: relativeTime
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
            {/* Main Temperature */}
            <h1 className="text-6xl font-light mb-2">{weatherData.temperature}°F</h1>
            
            {/* Weather Description and Location */}
            <h2 className="text-2xl font-light text-white/90 capitalize mb-1">
              {weatherData.description}
            </h2>
            <p className="text-lg text-white/70 mb-8">{weatherData.location}</p>

            {/* Weather Icon - Positioned to the right */}
            <div className="absolute top-4 right-16">
              <WeatherIcon weatherCondition={weatherData.description} />
            </div>

            {/* Main Weather Stats */}
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
                <p className="text-2xl">{weatherData.windSpeed} MPH</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-300">🌡️</span>
                  <span className="text-white/70">Pressure</span>
                </div>
                <p className="text-2xl">{weatherData.airPressure} hPa</p>
              </div>
            </div>

            {/* Additional Weather Info */}
            <div className="space-y-3 text-base">
              <div className="flex justify-between">
                <span className="text-white/70">Visibility</span>
                <span>{(weatherData.visibility / 1000).toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Cloud Cover</span>
                <span>{weatherData.clouds}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Chance of Rain</span>
                <span>{Math.round(weatherData.pop * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Sunrise</span>
                <span>{weatherData.sunrise}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Sunset</span>
                <span>{weatherData.sunset}</span>
              </div>
            </div>

            {/* Add last updated text at bottom of main display */}
            <div className="mt-4 text-sm text-white/50 text-center">
              Last updated {relativeTime}
            </div>
          </div>
        ) : (
          <FourDayForecast forecast={forecast.slice(0, daysToShow)} />
        )}
      </div>

      {/* Connection status moved below box */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-white/70 text-sm">
          <ConnectionStatus status={connectionStatus} />
        </div>
      </div>
    </div>
  );
}

export default Box;
