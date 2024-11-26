from flask import request, jsonify, json, Blueprint #,render_template, request
from app import mysql # , socketio, sockets
from flask import Flask, request, jsonify, json #,render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin

# If you need socketio stuff maybe uncomment the below line. 100% uncomment the stuff directly above
# from flask_socketio import SocketIO, join_room, leave_room, send, emit

# Feel free to add more imports


TherapistProfileData = Blueprint('TherapistProfileData', __name__)

@TherapistProfileData.route('/endpointOne', methods=['GET'])


@TherapistProfileData.route('/therapists')
def get_therapists():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Fetching therapists with their profile details and testimonials
    cursor.execute("""
        SELECT Users.Username, Therapists.Intro, Therapists.Education, Therapists.LicenseNumber, Therapists.Specializations,
        Therapists.DaysHours, Therapists.Price,
        Testimonials.Content AS Patient_Testimonial
        FROM Users
        JOIN Therapists ON Users.UserID = Therapists.UserID
        LEFT JOIN Testimonials ON Therapists.TherapistID = Testimonials.TherapistID
        WHERE Users.UserType = 'Therapist'
    """)
    therapists = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify({"Therapists": therapists})
    
