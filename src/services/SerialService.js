const SerialPort = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

// To check for serial ports on mac: ls /dev/tty.*
// To check for serial ports on windows: devmgmt.msc
// Example port on mac: /dev/tty.usbserial-10

const arduinoPort = '/dev/tty.usbserial-10';

class SerialService {
  constructor() {
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.portPath = arduinoPort;
    console.log(`[SerialService] Initializing with port: ${this.portPath}`);
    this.initializeConnection();
  }

  initializeConnection() {
    try {
      console.log(`[SerialService] Attempting connection to ${this.portPath}`);
      this.port = new SerialPort({
        path: this.portPath,
        baudRate: 115200
      });
      
      this.parser = this.port.pipe(new ReadlineParser());
      console.log('[SerialService] Setting up WebSocket server on port 8080');
      this.wss = new WebSocket.Server({ port: 8080 });
      
      this.setupPortListeners();
      this.setupWebSocket();
      this.setupSerialListener();
      
    } catch (error) {
      console.error('[SerialService] Connection error:', error);
      this.updateStatus('error', error.message);
    }
  }

  updateStatus(status, message = '') {
    console.log(`[SerialService] Status update: ${status}${message ? ` - ${message}` : ''}`);
    this.connectionStatus = status;
    this.isConnected = status === 'connected';
    
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'status',
            status,
            message
          }));
        }
      });
    }
  }

  setupPortListeners() {
    this.port.on('open', () => {
      console.log('[SerialService] Port opened successfully');
      this.updateStatus('connected');
    });

    this.port.on('error', (error) => {
      console.error('[SerialService] Port error:', error);
      this.updateStatus('error', error.message);
    });

    this.port.on('close', () => {
      console.warn('[SerialService] Port closed');
      this.updateStatus('disconnected');
      console.log('[SerialService] Attempting reconnection in 5 seconds...');
      setTimeout(() => this.initializeConnection(), 5000);
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('[SerialService] New WebSocket client connected');
      
      ws.send(JSON.stringify({
        type: 'status',
        status: this.connectionStatus
      }));
      
      ws.on('error', (error) => {
        console.error('[SerialService] WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('[SerialService] WebSocket client disconnected');
      });
    });

    this.wss.on('error', (error) => {
      console.error('[SerialService] WebSocket server error:', error);
    });
  }

  setupSerialListener() {
    this.parser.on('data', (data) => {
      try {
        console.log('[SerialService] Received data:', data);
        const matches = data.match(/Temperature:([\d.]+) Humidity:([\d.]+)/);
        if (matches) {
          const sensorData = {
            type: 'sensorData',
            temperature: parseFloat(matches[1]),
            humidity: parseFloat(matches[2]),
            timestamp: new Date().toISOString()
          };
          console.log('[SerialService] Parsed sensor data:', sensorData);

          this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(sensorData));
            }
          });
        } else {
          console.warn('[SerialService] Received data did not match expected format:', data);
        }
      } catch (error) {
        console.error('[SerialService] Error parsing serial data:', error);
      }
    });
  }
}

module.exports = new SerialService(); 