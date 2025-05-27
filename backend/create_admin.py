from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["car_database"]
cars = db["cars"]

# Ajoute une propriété vide 'comments' à chaque voiture si elle n'existe pas
for car in cars.find():
    if 'comments' not in car:
        cars.update_one(
            {"_id": car["_id"]},
            {"$set": {"comments": []}}
        )

print("✅ Tous les documents voiture ont maintenant un champ 'comments'.")
