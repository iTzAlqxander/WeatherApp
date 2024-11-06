// src/Box.js
import React from 'react';

function Box() {
  return (
    <div className="w-1/2 h-1/2 bg-white shadow-lg rounded-lg flex flex-col shadow-xl">
        
      <div className="bg-orange-300 p-4 text-center">
        <h1>Top</h1>
      </div>
      
      <div className="flex flex-1">
        <div className="w-1/2 h-full bg-yellow-300 flex items-center justify-center">
          <h1>1</h1>
        </div>

        <div className="w-1/2 h-full bg-green-300 flex items-center justify-center">
          <h1>2</h1>
        </div>
      </div>

    </div>
  );
}

export default Box;
