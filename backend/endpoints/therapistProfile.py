from flask import request, jsonify, json, Blueprint
from app import mysql
import os

# Define the Blueprint
therapist_routes = Blueprint('therapist_routes', __name__)

# Fetch all therapists with pagination
@therapist_routes.route('/api/therapists/', methods=['GET'])
def get_therapists():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page

        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT Users.UserID, Users.Username, Therapists.Intro, Therapists.Education, 
                   Therapists.LicenseNumber, Therapists.DaysHours, Therapists.Price, 
                   Therapists.Specializations
            FROM Users
            JOIN Therapists ON Users.UserID = Therapists.UserID
            WHERE Users.UserType = 'Therapist'
            LIMIT %s OFFSET %s
        """, (per_page, offset))
        therapists = cursor.fetchall()

        # Ensure all fields are JSON-serializable
        for therapist in therapists:
            if isinstance(therapist.get("Specializations"), set):
                therapist["Specializations"] = list(therapist["Specializations"])

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Failed to fetch therapists"}), 500
    finally:
        cursor.close()

    return jsonify({"Therapists": therapists, "page": page, "per_page": per_page})

# Fetch a specific therapist by UserID
@therapist_routes.route('/api/therapists/<int:user_id>', methods=['GET'])
def get_therapist_by_id(user_id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT Users.UserID, Users.Username, Therapists.Intro, Therapists.Education, 
                   Therapists.LicenseNumber, Therapists.DaysHours, Therapists.Price, 
                   Therapists.Specializations
            FROM Users
            JOIN Therapists ON Users.UserID = Therapists.UserID
            WHERE Users.UserID = %s AND Users.UserType = 'Therapist'
        """, (user_id,))
        therapist = cursor.fetchone()

        if not therapist:
            return jsonify({"error": "Therapist not found"}), 404

        # Ensure all fields are JSON-serializable
        if isinstance(therapist.get("Specializations"), set):
            therapist["Specializations"] = list(therapist["Specializations"])

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Failed to fetch therapist details"}), 500
    finally:
        cursor.close()

    return jsonify({"Therapist": therapist})
