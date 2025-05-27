from flask import render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import app, mongo
from bson.objectid import ObjectId

@app.route('/')
def home():
    cars = mongo.db.cars.find()
    return render_template('home.html', cars=cars)

@app.route('/car/<car_id>')
def car_details(car_id):
    car = mongo.db.cars.find_one_or_404({'_id': ObjectId(car_id)})
    return render_template('car_details.html', car=car)

@app.route('/admin')
@login_required
def admin():
    if not current_user.is_admin:
        flash('Access denied', 'danger')
        return redirect(url_for('home'))
    cars = mongo.db.cars.find()
    return render_template('admin.html', cars=cars)

@app.route('/admin/add', methods=['GET', 'POST'])
@login_required
def add_car():
    if not current_user.is_admin:
        flash('Access denied', 'danger')
        return redirect(url_for('home'))
    if request.method == 'POST':
        car_data = {
            'make': request.form.get('make'),
            'model': request.form.get('model'),
            'year': int(request.form.get('year')),
            'description': request.form.get('description'),
            'price': float(request.form.get('price')),
            # Handle image upload here
        }
        mongo.db.cars.insert_one(car_data)
        flash('Car added successfully', 'success')
        return redirect(url_for('admin'))
    return render_template('add_car.html')

@app.route('/admin/edit/<car_id>', methods=['GET', 'POST'])
@login_required
def edit_car(car_id):
    if not current_user.is_admin:
        flash('Access denied', 'danger')
        return redirect(url_for('home'))
    car = mongo.db.cars.find_one_or_404({'_id': ObjectId(car_id)})
    if request.method == 'POST':
        update_data = {
            'make': request.form.get('make'),
            'model': request.form.get('model'),
            'year': int(request.form.get('year')),
            'description': request.form.get('description'),
            'price': float(request.form.get('price')),
            # Handle image upload here
        }
        mongo.db.cars.update_one({'_id': ObjectId(car_id)}, {'$set': update_data})
        flash('Car updated successfully', 'success')
        return redirect(url_for('admin'))
    return render_template('edit_car.html', car=car)

@app.route('/admin/delete/<car_id>', methods=['POST'])
@login_required
def delete_car(car_id):
    if not current_user.is_admin:
        flash('Access denied', 'danger')
        return redirect(url_for('home'))
    mongo.db.cars.delete_one({'_id': ObjectId(car_id)})
    flash('Car deleted successfully', 'success')
    return redirect(url_for('admin'))# -*- coding: utf-8 -*-

