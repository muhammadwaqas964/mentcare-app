from flask import request, jsonify, json, Blueprint #,render_template, request
from app import mysql # , socketio, sockets
# If you need socketio stuff maybe uncomment the below line. 100% uncomment the stuff directly above
# from flask_socketio import SocketIO, join_room, leave_room, send, emit

# Feel free to add more imports


loginPageData = Blueprint('loginPageData', __name__)

@loginPageData.route('/patientOrTherapist', methods=['POST'])
def patientOrTherapistFunc():
    try:
        email = request.json.get('email')
        password = request.json.get('password')
        cursor = mysql.connection.cursor()
        cursor.execute('''
                SELECT userID, userType FROM users WHERE users.email LIKE %s AND users.pass LIKE %s
                ''', (email, password))
        data = cursor.fetchone()
        if data:
            #   user_id is used to get the respect patient/therapist ids
            user_id = data[0]
            user_type = data[1]  # Access the first (and only) column in the row
            if user_type == 'Patient':
                cursor.execute('''
                SELECT patientID from patients WHERE userID = %s               
                ''', (user_id, ))
                data = cursor.fetchone()
                userID = data[0]
            elif user_type == 'Therapist':
                cursor.execute('''
                SELECT therapistID from therapists WHERE userID = %s               
                ''', (user_id, ))
                data = cursor.fetchone()
                userID = data[0]
            
            #   userID ( NOT THE SAME AS user_id, im just bad at naming), is used to send the patient/therapist id
            #   back to client, no matter if patient or therapist
            return jsonify({"userType": user_type, "userID": userID})
        else:
            return jsonify({"error": "No user found with the given email and password"}), 404
    except Exception as err:
        return {"error":  f"{err}"}