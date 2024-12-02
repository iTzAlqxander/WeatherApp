const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9999;

// Enable CORS with specific options
app.use(cors({
    origin: 'http://localhost:3000', // Allow your React app's origin
    methods: ['GET', 'POST'],
    credentials: true
}));

// Add CORS headers to all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Initialize WebSocket server with CORS
const wss = new WebSocket.Server({ 
    port: 8080,
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

console.log('[WebSocket] Server started on port 8080');

// Serial port configuration
const SERIAL_PORT = '/dev/tty.usbserial-10';
const BAUD_RATE = 115200;

let serialPort;
let isConnecting = false;

async function initializeSerialPort() {
    if (isConnecting) return;
    isConnecting = true;

    try {
        console.log(`[Serial] Attempting to connect to ${SERIAL_PORT}`);
        
        // List available ports
        const ports = await SerialPort.list();
        console.log('[Serial] Available ports:', ports);

        // Close existing connection if it exists
        if (serialPort?.isOpen) {
            await new Promise((resolve) => {
                serialPort.close(() => {
                    console.log('[Serial] Closed existing connection');
                    resolve();
                });
            });
        }

        // Create new connection
        serialPort = new SerialPort({
            path: SERIAL_PORT,
            baudRate: BAUD_RATE,
            autoOpen: false
        });

        serialPort.open((err) => {
            if (err) {
                console.error('[Serial] Error opening port:', err.message);
                broadcastStatus('error', err.message);
                isConnecting = false;
                setTimeout(initializeSerialPort, 5000);
                return;
            }
            console.log('[Serial] Port opened successfully');
            isConnecting = false;
        });

        const parser = serialPort.pipe(new ReadlineParser());

        serialPort.on('open', () => {
            console.log('[Serial] Connection established');
            broadcastStatus('connected');
            isConnecting = false;
        });

        serialPort.on('error', (error) => {
            console.error('[Serial] Error:', error.message);
            broadcastStatus('error', error.message);
            isConnecting = false;
            setTimeout(initializeSerialPort, 5000);
        });

        serialPort.on('close', () => {
            console.log('[Serial] Connection closed');
            broadcastStatus('disconnected');
            isConnecting = false;
            setTimeout(initializeSerialPort, 5000);
        });

        parser.on('data', (data) => {
            console.log('[Serial] Received data:', data);
            try {
                const matches = data.match(/Temperature:([\d.]+) Humidity:([\d.]+)/);
                if (matches) {
                    const sensorData = {
                        type: 'sensorData',
                        temperature: parseFloat(matches[1]),
                        humidity: parseFloat(matches[2]),
                        timestamp: new Date().toISOString()
                    };
                    broadcastData(sensorData);
                }
            } catch (error) {
                console.error('[Serial] Error parsing data:', error);
            }
        });

    } catch (error) {
        console.error('[Serial] Initialization error:', error);
        broadcastStatus('error', error.message);
        isConnecting = false;
        setTimeout(initializeSerialPort, 5000);
    }
}

// WebSocket broadcast functions
function broadcastStatus(status, message = '') {
    const statusData = JSON.stringify({
        type: 'status',
        status,
        message
    });
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(statusData);
        }
    });
}

function broadcastData(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    
    // Send initial status
    if (serialPort) {
        ws.send(JSON.stringify({
            type: 'status',
            status: serialPort.isOpen ? 'connected' : 'disconnected'
        }));
    }

    ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
    });
});

// Express routes
app.get('/api/status', (req, res) => {
    res.json({
        serialConnected: serialPort?.isOpen || false
    });
});

// Initialize serial port connection
initializeSerialPort();
// Start Express server
app.listen(PORT, () => {
    console.log(`[Express] Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Cleaning up...');
    if (serialPort?.isOpen) {
        serialPort.close();
    }
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[Server] SIGINT received. Cleaning up...');
    if (serialPort?.isOpen) {
        serialPort.close();
    }
    process.exit(0);
});

// Add cleanup on process exit
process.on('exit', () => {
    if (serialPort?.isOpen) {
        serialPort.close();
    }
});