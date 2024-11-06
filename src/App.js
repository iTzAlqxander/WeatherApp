import React from 'react';
import Box from './components/Box';
import scenicBackground from './assets/bg.gif';

function App() {
  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${scenicBackground})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <Box />
    </div>
  );
}

export default App;
