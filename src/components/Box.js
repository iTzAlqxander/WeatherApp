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
    humidity: null
  });
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);

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
              humidity: data.humidity
            });
          }
        } catch (error) {
          console.error('[Box] Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.warn('[Box] WebSocket disconnected');
        setConnectionStatus('disconnected');
        setTimeout(connectWebSocket, 5000);
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

  // Update your weatherData object to use sensor data
  const weatherData = {
    temperature: sensorData.temperature || 58,
    condition: 'Sunny',
    location: 'Normal, IL',
    humidity: sensorData.humidity || 68,
    windSpeed: 2,
    airPressure: 30.15,
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
    </>
  );
}

export default Box;
