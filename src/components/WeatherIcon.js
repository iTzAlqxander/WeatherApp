import React from 'react';

function WeatherIcon({ weatherCondition }) {
  const getWeatherIcon = (condition) => {
    // Base URL for OpenWeatherMap icons
    const baseUrl = "https://openweathermap.org/img/wn/";
    
    // Map weather conditions to their respective icon codes
    const iconMap = {
      // Thunderstorm
      'thunderstorm with light rain': '11d',
      'thunderstorm with rain': '11d',
      'thunderstorm with heavy rain': '11d',
      'light thunderstorm': '11d',
      'thunderstorm': '11d',
      'heavy thunderstorm': '11d',
      'ragged thunderstorm': '11d',
      'thunderstorm with light drizzle': '11d',
      'thunderstorm with drizzle': '11d',
      'thunderstorm with heavy drizzle': '11d',
      
      // Drizzle
      'light intensity drizzle': '09d',
      'drizzle': '09d',
      'heavy intensity drizzle': '09d',
      'light intensity drizzle rain': '09d',
      'drizzle rain': '09d',
      'heavy intensity drizzle rain': '09d',
      'shower rain and drizzle': '09d',
      'heavy shower rain and drizzle': '09d',
      'shower drizzle': '09d',
      
      // Rain
      'light rain': '10d',
      'moderate rain': '10d',
      'heavy intensity rain': '10d',
      'very heavy rain': '10d',
      'extreme rain': '10d',
      'freezing rain': '13d',
      'light intensity shower rain': '09d',
      'shower rain': '09d',
      'heavy intensity shower rain': '09d',
      'ragged shower rain': '09d',
      
      // Snow
      'light snow': '13d',
      'snow': '13d',
      'heavy snow': '13d',
      'sleet': '13d',
      'light shower sleet': '13d',
      'shower sleet': '13d',
      'light rain and snow': '13d',
      'rain and snow': '13d',
      'light shower snow': '13d',
      'shower snow': '13d',
      'heavy shower snow': '13d',
      
      // Atmosphere
      'mist': '50d',
      'smoke': '50d',
      'haze': '50d',
      'sand/dust whirls': '50d',
      'fog': '50d',
      'sand': '50d',
      'dust': '50d',
      'volcanic ash': '50d',
      'squalls': '50d',
      'tornado': '50d',
      
      // Clear
      'clear sky': '01d',
      
      // Clouds
      'few clouds': '02d',
      'scattered clouds': '03d',
      'broken clouds': '04d',
      'overcast clouds': '04d',
      
      // Main conditions (fallbacks)
      'Clear': '01d',
      'Clouds': '04d',
      'Rain': '10d',
      'Snow': '13d',
      'Thunderstorm': '11d',
      'Drizzle': '09d',
      'Mist': '50d',
      'Smoke': '50d',
      'Haze': '50d',
      'Dust': '50d',
      'Fog': '50d',
      'Sand': '50d',
      'Ash': '50d',
      'Squall': '50d',
      'Tornado': '50d'
    };

    // Convert condition to lowercase for case-insensitive matching
    const normalizedCondition = condition.toLowerCase();
    
    // Get the icon code or use a default
    const iconCode = iconMap[normalizedCondition] || '01d';
    
    // Return the full URL with @2x for higher resolution
    return `${baseUrl}${iconCode}@2x.png`;
  };

  return (
    <div className="flex justify-center items-center">
      {weatherCondition ? (
        <img
          src={getWeatherIcon(weatherCondition)}
          alt={weatherCondition}
          className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getWeatherIcon('Clear'); // Fallback to clear sky icon if loading fails
          }}
        />
      ) : (
        <p className="text-white">No weather data</p>
      )}
    </div>
  );
}

export default WeatherIcon;
