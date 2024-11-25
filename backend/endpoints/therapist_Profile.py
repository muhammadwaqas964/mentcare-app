from flask import Blueprint, request, jsonify
import mysql.connector
import os

# Define the Blueprint
therapist_routes = Blueprint('therapist_routes', __name__)

# Database connection helper
def get_db_connection():
    try:
        return mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'mentcare1'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'root')
        )
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Fetch all therapists with pagination
@therapist_routes.route('/', methods=['GET'])
def get_therapists():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    offset = (page - 1) * per_page

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
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
        conn.close()

    return jsonify({"Therapists": therapists, "page": page, "per_page": per_page})

# Fetch a specific therapist by UserID
@therapist_routes.route('/<int:user_id>', methods=['GET'])
def get_therapist_by_id(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
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
        conn.close()

    return jsonify({"Therapist": therapist})
