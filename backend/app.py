from flask import Flask, jsonify, request, session, redirect, url_for, flash, send_file
from flask_cors import CORS
from flask_session import Session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from datetime import datetime, timedelta, timezone
import smtplib
from email.message import EmailMessage
import os, random, string


app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './flask_session/'
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

Session(app)
CORS(app, origins=[
    "http://localhost:3000", 
    "https://www.tazarentcar.com"
], supports_credentials=True)


# ========== DATABASE INIT ==========
client = MongoClient('mongodb://admin:FFaa2002%40@localhost:27017/')
db = client['car_database']
users_collection = db['users']
cars_collection = db['cars']
reviews_collection = db['reviews']
reservations_collection = db['reservations']

# ========== FIX DATE STYLE ==========

def format_rental_date(date_str):
    try:
        # يعالج مثلا: "2025-05-28T23:00:00.000Z"
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.strftime("%d/%m/%y")  # dd/mm/yy
    except Exception:
        return date_str

# ========== IMAGES FILES  ==========

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ========== LOGIN / SESSION / USER CLASS ==========
login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin):
    def __init__(self, email, password, role, username=None):
        self.email = email
        self.password_hash = password
        self.role = role
        self.username = username or email.split("@")[0]

    def get_id(self):
        return self.email

@login_manager.user_loader
def load_user(email):
    user_data = users_collection.find_one({"email": email})
    if user_data:
        return User(
            user_data['email'],
            user_data['password'],
            user_data['role'],
            user_data.get('username')
        )
    return None

# ========== USERS ==========
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_data = users_collection.find_one({"email": email})
    if user_data and check_password_hash(user_data['password'], password):
        user = User(
            user_data['email'],
            user_data['password'],
            user_data['role']
        )
        login_user(user)
        return jsonify({"message": "Login successful", "user": user_to_dict(user_data)})
    return jsonify({"message": "Invalid credentials"}), 401

def user_to_dict(user):
    return {
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "full_name": user.get("full_name", ""),
        "phone": user.get("phone", "")
    }


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    password = data.get('password')
    email = data.get('email')
    phone = data.get('phone')
    full_name = data.get('full_name')
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"message": "Email already in use"}), 400
    hashed_password = generate_password_hash(password)
    user_data = {
        "password": hashed_password,
        "role": "user",
        "email": email,
        "phone": phone,
        "full_name": full_name,
        "created_at": datetime.utcnow(),
        "notifications": True,
        "language": "en",
        "theme": "light"
    }
    users_collection.insert_one(user_data)
    return jsonify({
        "message": "Signup successful",
        "user": {
            "role": "user",
            "email": email,
            "phone": phone,
            "full_name": full_name
        }
    })

@app.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})

@app.route('/api/user/profile', methods=['GET', 'PUT'])
@login_required
def user_profile():
    if request.method == 'GET':
        user_data = users_collection.find_one(
            {"email": current_user.email},
            {"password": 0}
        )
        if not user_data:
            return jsonify({"error": "User not found"}), 404
        user_data['_id'] = str(user_data['_id'])
        return jsonify(user_data)
    elif request.method == 'PUT':
        data = request.get_json()
        update_data = {}
        if "email" in data: update_data["email"] = data["email"]
        if "phone" in data: update_data["phone"] = data["phone"]
        if "full_name" in data: update_data["full_name"] = data["full_name"]
        users_collection.update_one(
            {"email": current_user.email},
            {"$set": update_data}
        )
        user_data = users_collection.find_one({"email": current_user.email})
        user_data["_id"] = str(user_data["_id"])
        return jsonify(user_data)


@app.route('/api/user/profile', methods=['GET'])
@login_required
def get_profile():
    user = users_collection.find_one({"email": current_user.email}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user['_id'] = str(user['_id'])
    return jsonify(user)


@app.route('/api/user/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    update_data = {}
    if "email" in data: update_data["email"] = data["email"]
    if "phone" in data: update_data["phone"] = data["phone"]
    if "full_name" in data: update_data["full_name"] = data["full_name"]
    users_collection.update_one(
        {"email": current_user.email},
        {"$set": update_data}
    )
    user = users_collection.find_one({"email": current_user.email}, {"password": 0})
    user['_id'] = str(user['_id'])
    return jsonify(user)

@app.route('/api/user/settings', methods=['GET', 'PUT'])
@login_required
def user_settings():
    if request.method == 'GET':
        user_data = users_collection.find_one(
            {"username": current_user.username},
            {"notifications": 1, "language": 1, "theme": 1}
        )
        return jsonify(user_data or {})
    elif request.method == 'PUT':
        data = request.get_json()
        valid_settings = ['notifications', 'language', 'theme']
        update_data = {k: v for k, v in data.items() if k in valid_settings}
        users_collection.update_one(
            {"username": current_user.username},
            {"$set": update_data}
        )
        return jsonify({"message": "Settings updated successfully"})

@app.route('/api/user/settings', methods=['GET'])
@login_required
def get_settings():
    user = users_collection.find_one({"email": current_user.email}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    settings = {
        "language": user.get("language", "fr"),
        "theme": user.get("theme", "light"),
        "notifications": user.get("notifications", True)
    }
    return jsonify(settings)

@app.route('/api/user/settings', methods=['PUT'])
@login_required
def update_settings():
    data = request.get_json()
    update_data = {}
    if "language" in data: update_data["language"] = data["language"]
    if "theme" in data: update_data["theme"] = data["theme"]
    if "notifications" in data: update_data["notifications"] = data["notifications"]
    users_collection.update_one(
        {"email": current_user.email},
        {"$set": update_data}
    )
    return jsonify({"message": "Settings updated"})

@app.route('/api/user/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    user = users_collection.find_one({"email": current_user.email})
    if not user or not check_password_hash(user['password'], current_password):
        return jsonify({"error": "Mot de passe actuel incorrect"}), 400
    users_collection.update_one(
        {"email": current_user.email},
        {"$set": {"password": generate_password_hash(new_password)}}
    )
    return jsonify({"message": "Mot de passe changé avec succès"})

# ========== CARS ==========
@app.route('/api/cars', methods=['GET'])
def cars():
    if request.method == 'GET':
        query = {}
        search = request.args.get('search', '').lower()
        transmission = request.args.get('transmission', '').lower()
        availability = request.args.get('availability', '').lower()
        if search:
            query['$or'] = [
                {'make': {'$regex': search, '$options': 'i'}},
                {'model': {'$regex': search, '$options': 'i'}}
            ]
        if transmission:
            query['transmission'] = {'$regex': transmission, '$options': 'i'}
        if availability:
            query['is_available'] = (availability == 'true')
        cars = list(cars_collection.find(query))
        for car in cars:
            car_id = car['_id']
            comments = list(reviews_collection.find({'car_id': ObjectId(car_id)}))
            car['review_count'] = len(comments)
            car['average_rating'] = round(
                sum([int(c.get("rating", 0)) for c in comments]) / len(comments),
                1
            ) if comments else 0
        return jsonify([
            {
                "_id": str(car["_id"]),
                "make": car.get("make", ""),
                "model": car.get("model", ""),
                "year": car.get("year", ""),
                "description": car.get("description", ""),
                "price": car.get("price", 0),
                "images": car.get("images", []),
                "transmission": car.get("transmission", ""),
                "fuel": car.get("fuel", ""),
                "places": car.get("places", 4),
                "gear": car.get("gear", ""),
                "km": car.get("km", ""),
                "is_available": car.get("is_available", False),
                "review_count": car.get("review_count", 0),
                "average_rating": car.get("average_rating", 0),
                # ====== CHAMPS MANQUANTS À AJOUTER ICI ======
                "doors": car.get("doors", 4),
                "airConditioning": car.get("airConditioning", False),
                "type": car.get("type", ""),
            }
            for car in cars
        ])
    elif request.method == 'POST':
        data = request.form
        files = request.files.getlist('images')
        img_filenames = []
        for file in files:
            fname = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], fname)
            file.save(filepath)
            img_filenames.append(fname)
        car = {
            "make": data.get('make'),
            "model": data.get('model'),
            "year": int(data.get('year')) if data.get('year') else None,
            "description": data.get('description'),
            "price": int(data.get('price')) if data.get('price') else None,
            "images": img_filenames,
            "transmission": data.get('transmission'),
            "fuel": data.get('fuel'),
            "places": int(data.get('places')) if data.get('places') else None,
            "gear": data.get('gear'),
            "km": data.get('km'),
            "is_available": data.get('is_available') in ['true', 'True', 'on', '1'],
            "created_at": datetime.now(timezone.utc)
        }
        cars_collection.insert_one(car)
        return jsonify({"message": "Car added!"}), 201

@app.route('/api/car/<car_id>', methods=['GET'])
def get_car_details(car_id):
    car = cars_collection.find_one({"_id": ObjectId(car_id)})
    if not car:
        return jsonify({"error": "Car not found"}), 404
    comments = list(reviews_collection.find({'car_id': ObjectId(car_id)}))
    reservations = list(reservations_collection.find({'car_id': ObjectId(car_id)}))
    return jsonify({
        "car": {
            "_id": str(car["_id"]),
            "make": car.get("make", ""),
            "model": car.get("model", ""),
            "description": car.get("description", ""),
            "price": int(car.get("price", 0)),
            "year": int(car.get("year", 2000)),
            "transmission": car.get("transmission", ""),
            "fuel": car.get("fuel", ""),
            "places": int(car.get("places", 4)),
            "gear": car.get("gear", ""),
            "doors": int(car.get("doors", 4)),
            "airConditioning": car.get("airConditioning", False),
            "type": car.get("type", ""),
            "km": str(car.get("km", "")),
            "is_available": car.get("is_available") in ['true', 'True', True, 1],
            "images": car.get("images", []),
            "review_count": len(comments),
            "average_rating": round(sum([int(c.get("rating", 0)) for c in comments]) / len(comments), 1) if comments else 0
        },
        "comments": [
            {
                "_id": str(c["_id"]),
                "username": c.get("username", ""),
                "comment": c.get("comment", ""),
                "rating": int(c.get("rating", 0)),
                "admin_reply": c.get("admin_reply", ""),
                "timestamp": c.get("timestamp").isoformat() if isinstance(c.get("timestamp"), datetime) else ""
            }
            for c in comments
        ],
        "reservations": [
            {
                "_id": str(r["_id"]),
                "username": r.get("username", ""),
                "ville": r.get("ville", ""),
                "start_date": r.get("start_date", ""),
                "end_date": r.get("end_date", ""),
                "status": r.get("status", "")
            }
            for r in reservations
        ]
    })


@app.route('/api/car/<car_id>/images/<filename>', methods=['GET'])
def get_car_image(car_id, filename):
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    return send_file(image_path)

@app.route('/api/cars', methods=['GET'])
def get_all_cars():
    cars = list(cars_collection.find())
    for car in cars:
        car["_id"] = str(car["_id"])
    return jsonify(cars)


from datetime import datetime, timezone
def normalize_transmission(val):
    val = (val or '').strip().lower()
    if val in ['manual', 'manuelle']:
        return 'manuelle'
    if val in ['automatic', 'automatique']:
        return 'automatique'
    return val

def normalize_type(val):
    return (val or '').strip().lower()

@app.route('/api/cars', methods=['POST'])
def add_car():
    data = request.form
    files = request.files.getlist('images')
    img_filenames = []
    for file in files:
        fname = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], fname)
        file.save(filepath)
        img_filenames.append(fname)
    car = {
        "make": data.get('make', ''),
        "model": data.get('model', ''),
        "year": int(data.get('year')) if data.get('year') else None,
        "description": data.get('description', ''),
        "price": int(data.get('price')) if data.get('price') else None,
        "images": img_filenames,
        "transmission": normalize_transmission(data.get('transmission')),
        "fuel": data.get('fuel', ''),
        "places": int(data.get('places')) if data.get('places') else None,
        "gear": data.get('gear', ''),
        "km": data.get('km', ''),
        # !! C’est ici le changement :
        "is_available": str(data.get('is_available', 'false')).strip().lower() == "true",
        "created_at": datetime.now(timezone.utc),
        "type": normalize_type(data.get('type')),
        "doors": int(data.get('doors')) if data.get('doors') else 4,
        "airConditioning": str(data.get('airConditioning', 'false')).strip().lower() == "true"
    }
    cars_collection.insert_one(car)
    car["_id"] = str(car["_id"])
    return jsonify({"message": "Car added!", "car": car}), 201



    
@app.route('/api/car/<car_id>', methods=['PUT'])
def edit_car(car_id):
    data = request.form if request.form else request.get_json()
    data = data.copy() if hasattr(data, "copy") else dict(data)

    # Handling radio "Oui"/"Non" (always "true"/"false" as string, never undefined)
    is_available_val = str(data.get('is_available', 'false')).strip().lower()
    data['is_available'] = is_available_val == 'true'

    air_conditioning_val = str(data.get('airConditioning', 'false')).strip().lower()
    data['airConditioning'] = air_conditioning_val == 'true'

    update_data = {}
    fields = [
        "make", "model", "year", "description", "price", "transmission", "fuel",
        "places", "gear", "km", "is_available", "type", "doors", "airConditioning"
    ]
    for field in fields:
        value = data.get(field)
        if value is not None:
            if field == "transmission":
                update_data[field] = normalize_transmission(value)
            elif field == "type":
                update_data[field] = normalize_type(value)
            elif field in ["year", "price", "places", "doors"]:
                try:
                    update_data[field] = int(value)
                except Exception:
                    update_data[field] = value
            else:
                update_data[field] = value

    # Images : upload si nécessaire
    if 'images' in request.files:
        files = request.files.getlist('images')
        img_filenames = []
        for file in files:
            fname = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], fname)
            file.save(filepath)
            img_filenames.append(fname)
        update_data['images'] = img_filenames
    # Si tu veux gérer old_images, tu peux compléter ici.

    cars_collection.update_one({"_id": ObjectId(car_id)}, {"$set": update_data})
    car = cars_collection.find_one({"_id": ObjectId(car_id)})
    car["_id"] = str(car["_id"])
    return jsonify({"message": "Car updated successfully", "car": car})

@app.route('/api/car/<car_id>', methods=['DELETE'])
def delete_car(car_id):
    result = cars_collection.delete_one({"_id": ObjectId(car_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Car deleted successfully"})
    return jsonify({"error": "Car not found"}), 404


# ========== REVIEWS / COMMENTS ==========
@app.route('/api/car/<car_id>/comment', methods=['POST'])
def add_comment(car_id):
    data = request.get_json()
    rating = int(data.get('rating'))
    comment = data.get('comment')
    username = data.get('username') or "Visiteur"
    if 1 <= rating <= 5 and comment.strip():
        reviews_collection.insert_one({
            'car_id': ObjectId(car_id),
            'username': username,
            'rating': rating,
            'comment': comment,
            'admin_reply': '',
            'timestamp': datetime.now(timezone.utc)
        })
    return jsonify({"message": "Comment added"})

@app.route('/api/comment/<comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    reviews_collection.delete_one({"_id": ObjectId(comment_id)})
    return jsonify({"message": "Commentaire supprimé"})

@app.route('/api/comment/<comment_id>/reply', methods=['PUT'])
def reply_comment(comment_id):
    data = request.get_json()
    reply = data.get("reply", "")
    reviews_collection.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": {"admin_reply": reply}}
    )
    return jsonify({"message": "Réponse ajoutée"})

# ========== CAPTCHA ==========
@app.route('/api/captcha')
def captcha_image():
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    session['captcha_code'] = captcha_text
    image = Image.new('RGB', (150, 50), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()
    draw.text((10, 10), captcha_text, font=font, fill=(0, 0, 0))
    buffer = BytesIO()
    image.save(buffer, 'PNG')
    buffer.seek(0)
    return send_file(buffer, mimetype='image/png')

# ========== RESERVATIONS ==========
@app.route('/api/reserve/<car_id>', methods=['POST'])
@login_required
def reserve_car(car_id):
    car = cars_collection.find_one({"_id": ObjectId(car_id)})
    if not car or not car.get("is_available", False):
        return jsonify({"error": "Car not available"}), 400

    data = request.get_json()
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    ville = data.get("ville")
    full_name = data.get("full_name", "")
    phone = data.get("phone", "")

    user_data = users_collection.find_one({"email": current_user.email})

    # Vérifie TOUS les champs (full_name, phone aussi) AVANT d’insérer :
    if not all([start_date, end_date, ville]) or not (full_name or user_data.get("full_name")) or not (phone or user_data.get("phone")):
        return jsonify({"error": "Champs manquants"}), 400

    reservation = {
        "car_id": ObjectId(car_id),
        "email": user_data.get("email", current_user.email),
        "full_name": full_name or user_data.get("full_name", ""),
        "phone": phone or user_data.get("phone", ""),
        "status": "en attente",
        "start_date": start_date,
        "end_date": end_date,
        "ville": ville,
        "created_at": datetime.utcnow()
    }
    reservations_collection.insert_one(reservation)
    return jsonify({"message": "Réservation en attente de validation"}), 201


# ========== ADMIN ZONE ==========
@app.route('/api/admin/stats')
def admin_stats():
    total_cars = cars_collection.count_documents({})
    available_cars = cars_collection.count_documents({"is_available": True})
    total_users = users_collection.count_documents({})
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users = users_collection.count_documents({"created_at": {"$gte": week_ago}})
    all_prices = []
    for c in cars_collection.find():
        price = c.get('price')
        try:
            if price is not None:
                all_prices.append(int(price))
        except:
            pass
    avg_price = int(sum(all_prices) / len(all_prices)) if all_prices else 0
    car_types = {}
    for car in cars_collection.find():
        make = car.get('make', 'Inconnu')
        car_types[make] = car_types.get(make, 0) + 1
    contrats_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'contrats')
    all_files = [f for f in os.listdir(contrats_dir) if f.endswith('.doc') or f.endswith('.docx')]
    total_contract_files = len(all_files)
    recent_contracts = 0
    now = datetime.now(timezone.utc)
    for f in all_files:
        path = os.path.join(contrats_dir, f)
        modified = datetime.fromtimestamp(os.path.getmtime(path), timezone.utc)
        if (now - modified).days <= 28:
            recent_contracts += 1
    return jsonify({
        "totalCars": total_cars,
        "availableCars": available_cars,
        "rentedCars": total_cars - available_cars,
        "totalUsers": total_users,
        "newUsers": new_users,
        "avgPrice": avg_price,
        "totalContracts": total_contract_files,
        "recentContracts": recent_contracts,
        "carTypes": car_types
    })

@app.route('/api/admin/users')
def get_users():
    users = list(users_collection.find({}, {"_id": 0}))
    return jsonify(users)

@app.route('/api/admin/users/<email>', methods=['DELETE'])
def delete_user(email):
    users_collection.delete_one({"email": email})
    return jsonify({"message": "User deleted"})

@app.route('/api/admin/users/<email>/role', methods=['PUT'])
@login_required
def update_user_role(email):
    if current_user.role != "admin":
        return jsonify({"error": "Permission denied"}), 403
    data = request.get_json()
    new_role = data.get("role")
    if new_role not in ["user", "admin"]:
        return jsonify({"error": "Rôle invalide"}), 400
    if current_user.email == email and new_role != "admin":
        return jsonify({"error": "Impossible de se retirer le rôle admin"}), 400
    users_collection.update_one(
        {"email": email},
        {"$set": {"role": new_role}}
    )
    return jsonify({"message": f"Rôle de {email} mis à jour en {new_role} ✅"})



@app.route('/api/admin/users/delete-bulk', methods=['POST'])
@login_required
def delete_multiple_users():
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    usernames = data.get("usernames", [])
    if not usernames:
        return jsonify({"error": "Aucun utilisateur sélectionné"}), 400
    if current_user.username in usernames:
        return jsonify({"error": "Impossible de vous supprimer vous-même"}), 400
    result = users_collection.delete_many({"username": {"$in": usernames}})
    return jsonify({"message": f"{result.deleted_count} utilisateurs supprimés."})

@app.route('/api/admin/users/stats', methods=['GET'])
@login_required
def get_user_stats():
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    total = users_collection.count_documents({})
    total_admins = users_collection.count_documents({"role": "admin"})
    total_users = users_collection.count_documents({"role": "user"})
    recent = datetime.utcnow() - timedelta(days=30)
    new_users = users_collection.count_documents({"created_at": {"$gte": recent}})
    return jsonify({
        "total": total,
        "admins": total_admins,
        "users": total_users,
        "newUsersLast30Days": new_users
    })

@app.route('/api/admin/reservations', methods=['GET', 'PUT'])
@login_required
def manage_reservations():
    # ====== Securité admin ======
    user = users_collection.find_one({"email": current_user.email})
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Non autorisé"}), 403

    # ====== GET : Afficher toutes les réservations ======
    if request.method == 'GET':
        reservations = list(reservations_collection.find())
        for r in reservations:
            r['_id'] = str(r['_id'])
            # ==== Affichage nom de la voiture au lieu de l'id ====
            if "car_id" in r and r["car_id"]:
                try:
                    # Convertir car_id à ObjectId si besoin
                    car_id_obj = r["car_id"]
                    if not isinstance(car_id_obj, ObjectId):
                        try:
                            car_id_obj = ObjectId(car_id_obj)
                        except Exception:
                            car_id_obj = None
                    if car_id_obj:
                        car_obj = cars_collection.find_one({"_id": car_id_obj})
                        if car_obj:
                            # Marque + Modèle = nom complet de la voiture
                            r["car_name"] = f"{car_obj.get('make', '')} {car_obj.get('model', '')}".strip()
                        else:
                            r["car_name"] = "-"
                    else:
                        r["car_name"] = "-"
                    r["car_id"] = str(r["car_id"])
                except Exception:
                    r["car_name"] = "-"
                    r["car_id"] = str(r["car_id"])
            else:
                r["car_id"] = None
                r["car_name"] = "-"

            r["email"] = r.get("email", "")
            r["full_name"] = r.get("full_name", "")
            r["phone"] = r.get("phone", "")
        return jsonify(reservations)

    # ====== PUT : Mise à jour du statut et envoi email si accepté ======
    elif request.method == 'PUT':
        data = request.get_json()
        reservation_id = data.get("reservation_id")
        new_status = data.get("status")

        reservation = reservations_collection.find_one({"_id": ObjectId(reservation_id)})
        if reservation:
            reservations_collection.update_one(
                {"_id": ObjectId(reservation_id)},
                {"$set": {"status": new_status}}
            )

            email_to = reservation.get("email", "")
            customer_name = reservation.get("full_name", "")

            # Si acceptée: envoie email confirmation voiture ou transport
            if new_status == "acceptée":
                print("[DEBUG] Acceptée, tentative d'envoi d'email.")
                print("email_to:", email_to)
                print("car_id:", reservation.get("car_id"))
                print("reservation:", reservation)
                if reservation.get("car_id"):
                    car = cars_collection.find_one({"_id": ObjectId(reservation["car_id"])})
                    if car and email_to and "@" in email_to:
                        send_confirmation_email(
                                    email_to,
                                    car.get("make", ""),
                                    car.get("model", ""),
                                    str(car.get("year", "")),
                                    customer_name,
                                    format_rental_date(reservation.get("start_date", ""))
                                )
                        
                elif reservation.get("type") == "transport":
                    if email_to and "@" in email_to:
                        send_transport_email(email_to, reservation, customer_name)
                    else:
                        print(f"[❌ EMAIL TRANSPORT] Email destinataire non valide: '{email_to}'")
            return jsonify({"message": "Mise à jour effectuée ✅"})

        return jsonify({"error": "Réservation non trouvée"}), 404



# ========== CONTRATS ==========
CONTRATS_DIR = os.path.join(app.config['UPLOAD_FOLDER'], 'contrats')
os.makedirs(CONTRATS_DIR, exist_ok=True)

@app.route('/api/admin/contrats', methods=['GET'])
def list_contrats():
    contrats = []
    for filename in os.listdir(CONTRATS_DIR):
        if filename.endswith('.doc') or filename.endswith('.docx'):
            path = os.path.join(CONTRATS_DIR, filename)
            added = datetime.fromtimestamp(os.path.getmtime(path)).isoformat()
            contrats.append({'filename': filename, 'date': added})
    return jsonify(contrats)

@app.route('/api/admin/contrats', methods=['POST'])
def upload_contrats():
    files = request.files.getlist('contrats')
    for file in files:
        fname = secure_filename(file.filename)
        file.save(os.path.join(CONTRATS_DIR, fname))
    return jsonify({"message": "Files uploaded"})

@app.route('/api/admin/contrats/<filename>', methods=['DELETE'])
def delete_contrat(filename):
    path = os.path.join(CONTRATS_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
    return jsonify({"message": "File deleted"})

@app.route('/api/admin/contrats/download/<filename>')
def download_contrat(filename):
    path = os.path.join(CONTRATS_DIR, filename)
    return send_file(path, as_attachment=True)

# ========== EMAIL ==========
def send_verification_code_email(to_email, code):
    msg = EmailMessage()
    msg["Subject"] = "Votre code de vérification | tazarentcar.com"
    msg["From"] = "Taza Rent Car <azaryouhrif@gmail.com>"
    msg["To"] = to_email

    plain_text = f"Voici votre code de vérification : {code}\nValable pendant 10 minutes."

    html_content = f"""
<html>
<body style="font-family:'Segoe UI', Arial, sans-serif; background:#f7fafc; margin:0; padding:0;">
  <div style="max-width:440px; margin:40px auto; background:#fff; border-radius:16px; box-shadow:0 6px 24px rgba(52,94,175,0.08); overflow:hidden; border:2.5px solid #e30613;">
    <div style="padding:32px 32px 15px; text-align:center;">
      <img src="https://i.imgur.com/WUQ0dgd.jpeg" width="60" style="margin-bottom:11px; border-radius:10px; box-shadow:0 1px 8px rgba(52,94,175,0.13);"/>
      <h2 style="color:#e30613; margin-bottom:8px;">Vérification de votre adresse email</h2>
      <p style="font-size:16px; color:#333; margin-bottom:17px;">
        Pour finaliser votre inscription sur <b>tazarentcar.com</b>, veuillez saisir le code ci-dessous :
      </p>
      <div style="background:#f9f3f4; border:1.5px solid #e30613; border-radius:11px; display:inline-block; padding:13px 24px; margin-bottom:18px;">
        <span style="font-size:32px; font-weight:700; letter-spacing:6px; color:#e30613; font-family:monospace;">{code}</span>
      </div>
      <p style="color:#444; font-size:15px; margin-bottom:9px;">
        <b>Ce code est valable pendant 10 minutes.</b>
      </p>
      <div style="background:#f6f8fa; border-radius:8px; padding:10px 9px; font-size:14px; color:#626262; margin-bottom:13px;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
      </div>
      <a href="https://www.tazarentcar.com" style="display:inline-block; margin-top:10px; color:#e30613; text-decoration:none; font-weight:500; font-size:15px;">
        Visiter tazarentcar.com
      </a>
    </div>
    <div style="background:#f7fafc; padding:13px 20px; text-align:center; font-size:12px; color:#888;">
      Pour assistance, contactez <a href="mailto:azaryouhrif@gmail.com" style="color:#e30613;">azaryouhrif@gmail.com</a> ou appelez <span style="color:#3446ad;">+212-661-306515</span>
    </div>
  </div>
</body>
</html>
"""

    msg.set_content(plain_text)
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login("fayssal.abaibat.2002@gmail.com", "kymi wunu jftx aqst")
            smtp.send_message(msg)
            print(f"[✅ EMAIL VERIF CODE] envoyé à {to_email}")
    except Exception as e:
        print("[❌ EMAIL VERIF FAILED]", e)


@app.route('/api/send-verification-code', methods=['POST'])
def send_verification_code():
    data = request.get_json()
    to_email = data.get('email')
    if not to_email:
        return jsonify({'error': 'Email manquant'}), 400

    code = ''.join(random.choices(string.digits, k=6))
    session['verification_code'] = code
    session['verification_email'] = to_email

    send_verification_code_email(to_email, code)
    return jsonify({'message': 'Code envoyé'})
@app.route('/api/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    # On vérifie le code et l'email stockés en session
    session_code = session.get('verification_code')
    session_email = session.get('verification_email')

    if session_code is None or session_email is None:
        return jsonify({'success': False, 'message': "Aucun code envoyé ou session expirée"}), 400

    if email == session_email and code == session_code:
        # Optionnel : supprimer les infos pour éviter la réutilisation du code
        session.pop('verification_code', None)
        session.pop('verification_email', None)
        return jsonify({'success': True, 'message': "Code vérifié avec succès"})
    else:
        return jsonify({'success': False, 'message': "Code invalide ou expiré"}), 400



def send_transport_email(to_email, reservation, customer_name):
    msg = EmailMessage()
    msg["Subject"] = "🚌 Confirmation de votre transfert aéroport | tazarentcar.com"
    msg["From"] = "Taza Rent Car <azaryouhrif@gmail.com>"
    msg["To"] = to_email

    aeroport = reservation.get("aeroport", "—")
    ville = reservation.get("ville", "—")
    date = reservation.get("date", "—")

    plain_text = f"""
Bonjour {customer_name},

Votre demande de transfert aéroport a été bien enregistrée.

Notre équipe va vous appeler très prochainement pour finaliser les détails, confirmer le lieu et l'heure du rendez-vous, et répondre à toutes vos questions.

Résumé :
• Ville de départ : {ville}
• Aéroport : {aeroport}
• Date : {date}

Pour toute assistance urgente, appelez-nous au +212-661-306515 ou écrivez à azaryouhrif@gmail.com.

Merci pour votre confiance !
L'équipe Taza Rent Car
"""

    html_content = f"""
<html>
<body style="font-family:'Segoe UI', Arial, sans-serif; background:#f7fafc; margin:0; padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;box-shadow:0 6px 24px rgba(52,94,175,0.09);overflow:hidden;">
    <div style="padding:35px 32px 18px;text-align:center;">
      <img src="https://i.imgur.com/WUQ0dgd.jpeg" width="80" style="margin-bottom:14px;border-radius:10px;box-shadow:0 2px 12px rgba(52,94,175,0.13);">
      <h1 style="color:#0ea5e9;margin-bottom:8px;">Transfert Aéroport Confirmé !</h1>
      <p style="font-size:18px;color:#333;margin-bottom:18px;">
        Bonjour <b>{customer_name}</b>,
      </p>
    </div>
    <div style="padding:0 32px 18px;font-size:16px;color:#444;line-height:1.6;">
      <p>
        Votre demande de <b>transfert aéroport</b> a été <span style="color:#0ea5e9;font-weight:600;">bien enregistrée</span> !
      </p>
      <p>
        <b>Notre équipe va vous appeler très prochainement</b> pour finaliser les détails, confirmer l’heure exacte et le lieu du rendez-vous, et répondre à toutes vos questions.<br>
        <span style="color:#6c757d;font-size:15px;">Merci de garder votre téléphone accessible.</span>
      </p>
      <div style="background:#f8fafd;padding:11px 18px;margin:20px 0 12px;border-radius:9px;">
        <b>Résumé :</b><br>
        • Ville de départ : <b>{ville}</b><br>
        • Aéroport : <b>{aeroport}</b><br>
        • Date : <b>{date}</b>
      </div>
      <p>
        Pour toute demande urgente, contactez-nous au <b>+212-661-306515</b> ou par email à
        <a href="mailto:azaryouhrif@gmail.com" style="color:#0ea5e9;">azaryouhrif@gmail.com</a>.
      </p>
      <p style="margin-top:26px;">
        Merci pour votre confiance.<br>
        <span style="font-weight:600;">L’équipe Taza Rent Car</span>
      </p>
    </div>
    <div style="background:#f8fafd;padding:13px 20px;text-align:center;font-size:13px;color:#888;border-top:1.5px solid #f1f1f1;">
      © 2025 Taza Rent Car — <a href="https://www.tazarentcar.com" style="color:#0ea5e9;">tazarentcar.com</a>
    </div>
  </div>
</body>
</html>
"""

    msg.set_content(plain_text)
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login("fayssal.abaibat.2002@gmail.com", "kymi wunu jftx aqst")
            smtp.send_message(msg)
            print(f"[✅ EMAIL TRANSPORT] envoyé à {to_email}")
    except Exception as e:
        print("[❌ EMAIL TRANSPORT FAILED]", e)

# ========== VERIFICATION EMAIL / CODES ==========

@app.route('/api/admin/verify-password', methods=['POST'])
@login_required
def verify_admin_password():
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    password = data.get("password")
    user_data = users_collection.find_one({"username": current_user.username})
    if not user_data or not check_password_hash(user_data['password'], password):
        return jsonify({"valid": False}), 401

# ========== TRANSPORT / AÉROPORT ==========
@app.route('/api/transport', methods=['POST'])
@login_required
def transport():
    data = request.get_json()
    full_name = data.get('full_name', '')    # ← الاسم الكامل من الفورم (ولّي input واحد)
    tel = data.get('phone', '')              # ← الهاتف من الفورم (ولّي phone)
    ville = data.get('ville')
    aeroport = data.get('aeroport')
    date = data.get('date')
    user_data = users_collection.find_one({"email": current_user.email})

    reservation = {
        'type': 'transport',
        'full_name': full_name or user_data.get("full_name", ""),    # ← اسم الزبون
        'email': user_data.get("email", current_user.email),         # ← ايميل الزبون
        'phone': tel or user_data.get("phone", ""),                  # ← الهاتف
        'ville': ville,
        'aeroport': aeroport,
        'date': date,
        'status': 'en attente',
        'created_at': datetime.utcnow()
    }
    reservations_collection.insert_one(reservation)
    return jsonify({"message": "Demande de transport reçue"}), 201

def send_confirmation_email(to_email, make, model, year, customer_name, rental_date):
    msg = EmailMessage()
    msg["Subject"] = "✅ Confirmation officielle de votre réservation | tazarentcar.com"
    msg["From"] = "Taza Rent Car <azaryouhrif@gmail.com>"
    msg["To"] = to_email

    car_full_name = f"{make} {model} {year}"

    plain_text = f"""
Bonjour {customer_name},

Votre réservation pour la voiture « {car_full_name} » est bien enregistrée pour la date du {rental_date}.

Notre équipe va vous contacter très prochainement par téléphone pour finaliser les détails de votre location et répondre à toutes vos questions.

Un rappel vous sera également envoyé avant la date de location.

Pour toute assistance, n'hésitez pas à nous appeler au +212-661-306515 ou à écrire à azaryouhrif@gmail.com.

Merci pour votre confiance.
L'équipe Taza Rent Car
"""

    html_content = f"""
<html>
<body style="font-family:'Segoe UI', Arial, sans-serif; background:#f7fafc; margin:0; padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;box-shadow:0 6px 24px rgba(52,94,175,0.09);overflow:hidden;">
    <div style="padding:35px 32px 18px;text-align:center;">
      <img src="https://i.imgur.com/WUQ0dgd.jpeg" width="80" style="margin-bottom:14px;border-radius:10px;box-shadow:0 2px 12px rgba(52,94,175,0.13);">
      <h1 style="color:#e30613;margin-bottom:8px;">Réservation Confirmée !</h1>
      <p style="font-size:18px;color:#333;margin-bottom:18px;">
        Bonjour <b>{customer_name}</b>,
      </p>
    </div>
    <div style="padding:0 32px 18px;font-size:16px;color:#444;line-height:1.6;">
      <p>
        Votre réservation pour la voiture <b>{car_full_name}</b> est <span style="color:#0ea5e9;font-weight:600;">bien enregistrée</span> pour la date du <b>{rental_date}</b> !
      </p>
      <p>
        <b>Notre équipe va vous appeler très prochainement</b> pour finaliser les détails de votre location, confirmer vos besoins et répondre à toutes vos questions.<br>
        <span style="color:#6c757d;font-size:15px;">Merci de garder votre téléphone accessible.</span>
      </p>
      <p>
        Un rappel vous sera également envoyé avant la date de location.<br>
        Pour toute demande urgente, contactez-nous au <b>+212-661-306515</b> ou par email à <a href="mailto:azaryouhrif@gmail.com" style="color:#e30613;">azaryouhrif@gmail.com</a>.
      </p>
      <p style="margin-top:26px;">
        Merci pour votre confiance.<br>
        <span style="font-weight:600;">L’équipe Taza Rent Car</span>
      </p>
    </div>
    <div style="background:#f8fafd;padding:13px 20px;text-align:center;font-size:13px;color:#888;border-top:1.5px solid #f1f1f1;">
      © 2025 Taza Rent Car — <a href="https://www.tazarentcar.com" style="color:#e30613;">tazarentcar.com</a>
    </div>
  </div>
</body>
</html>
"""

    msg.set_content(plain_text)
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login("fayssal.abaibat.2002@gmail.com", "kymi wunu jftx aqst")
            smtp.send_message(msg)
            print(f"[✅ EMAIL] envoyé à {to_email}")
    except Exception as e:
        print("[❌ EMAIL FAILED]", e)



from werkzeug.security import generate_password_hash

def create_default_admin():
    admin_email = "fou.ad@gmail.com"
    admin_pwd = "Fouad@2025@Admin"
    admin_data = users_collection.find_one({"email": admin_email})
    if not admin_data:
        users_collection.insert_one({
            "email": admin_email,
            "password": generate_password_hash(admin_pwd),  # toujours hash le mdp!
            "role": "admin",
            "full_name": "Fouad Admin"
        })
        print(">>> Admin par défaut ajouté !")
    else:
        print(">>> Admin déjà existant !")

create_default_admin()


# ========== MAIN ==========
if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=5000)
