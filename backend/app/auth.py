from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required
from app import app, mongo
from app.models import User
from bson.objectid import ObjectId

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user_data = mongo.db.users.find_one({'username': username})
        if user_data and User(user_data).check_password(password):
            user = User(user_data)
            login_user(user)
            flash('Logged in successfully', 'success')
            return redirect(url_for('admin' if user.is_admin else 'home'))
        flash('Invalid credentials', 'danger')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have logged out', 'success')
    return redirect(url_for('home'))# -*- coding: utf-8 -*-

