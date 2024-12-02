import React from 'react';

function ConnectionStatus({ status }) {
  console.log('[ConnectionStatus] Current status:', status);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'disconnected':
        return 'bg-gray-500';
      default:
        console.warn('[ConnectionStatus] Unknown status:', status);
        return 'bg-gray-500';
    }
  };

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-gray-800 bg-opacity-50 rounded-full px-3 py-1.5">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs text-white capitalize">
        {status === 'connected' ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

export default ConnectionStatus; 