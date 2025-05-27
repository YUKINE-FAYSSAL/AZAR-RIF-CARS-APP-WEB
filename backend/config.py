import os

class Config:
    SECRET_KEY = os.environ.get('bonjour') 
    MONGO_URI = 'mongodb://localhost:27017/car_database'


