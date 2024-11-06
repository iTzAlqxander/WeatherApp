from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

# Initialize the Flask app and database
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///weather_data.db'
db = SQLAlchemy(app)

# Define the database model
class WeatherData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    air_pressure = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create the database tables
with app.app_context():
    db.create_all()

# Define the POST endpoint to receive data from the ESP32
@app.route('/data', methods=['POST'])
def add_weather_data():
    data = request.get_json()
    if not data or 'temperature' not in data or 'humidity' not in data or 'air_pressure' not in data:
        return jsonify({"error": "Invalid data"}), 400
    
    new_data = WeatherData(
        temperature=data['temperature'],
        humidity=data['humidity'],
        air_pressure=data['air_pressure']
    )
    db.session.add(new_data)
    db.session.commit()
    
    return jsonify({"message": "Data added successfully"}), 201

# Define the GET endpoint to retrieve weather data
@app.route('/data', methods=['GET'])
def get_weather_data():
    hours = request.args.get('hours', default=24, type=int)
    cutoff = datetime.utcnow() - timedelta(hours=hours)

    data = WeatherData.query.filter(WeatherData.timestamp >= cutoff).all()
    result = [
        {
            "temperature": d.temperature, 
            "humidity": d.humidity, 
            "air_pressure": d.air_pressure, 
            "timestamp": d.timestamp
        } 
        for d in data
    ]
    
    return jsonify(result)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
