import React from 'react';
import WeatherIcon from './WeatherIcon';

function FourDayForecast({ forecast }) {
  if (!forecast || forecast.length === 0) {
    return <p className="text-white/70">Loading forecast data...</p>;
  }

  // Modified sorting to ensure correct order
  const sortedForecast = [...forecast].sort((a, b) => {
    const dateA = new Date(a.date).setHours(0, 0, 0, 0);
    const dateB = new Date(b.date).setHours(0, 0, 0, 0);
    return dateA - dateB;
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-4 gap-4">
        {sortedForecast.map((day, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
          >
            {/* Day */}
            <h2 className="text-2xl font-light text-white mb-6">
              {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
            </h2>
            
            {/* Weather Icon */}
            <div className="w-24 h-24 mb-4">
              <WeatherIcon weatherCondition={day.description} />
            </div>
            
            <div className="flex flex-col items-center mb-6" style={{ height: '50px' }}>
              <p className="text-lg text-white/90 capitalize text-center" style={{
                 whiteSpace: 'normal',
                 textAlign: 'center',
               }}
                >
                {day.description}
               </p>
            </div>

            
            {/* Temperatures with separator - ensure consistent width and alignment */}
            <div className="flex items-center justify-center w-full text-2xl mb-6">
              <span className="text-white">{Math.round(day.high)}°</span>
              <span className="text-white/30 mx-3">|</span>
              <span className="text-white/50">{Math.round(day.low)}°</span>
            </div>

            {/* Additional Info */}
            <div className="w-full space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Rain</span>
                <span className="text-white">{Math.round(day.pop * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Humidity</span>
                <span className="text-white">{day.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Wind</span>
                <span className="text-white">{Math.round(day.windSpeed)} mph</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FourDayForecast;
