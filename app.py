# app.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from config import config

app = Flask(__name__)

# Load configuration based on environment
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])

db = SQLAlchemy(app)
