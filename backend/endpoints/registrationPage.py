from flask import request, jsonify, json, Blueprint #,render_template, request
from app import mysql # , socketio, sockets
# If you need socketio stuff maybe uncomment the below line. 100% uncomment the stuff directly above
# from flask_socketio import SocketIO, join_room, leave_room, send, emit

# Feel free to add more imports


registrationPageData = Blueprint('registrationPageData', __name__)

@registrationPageData.route("/validateUserEmail", methods=['POST'])
def validateEmailFunc():
    email = request.json.get('email')
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT email FROM users WHERE email LIKE %s", (email, ))
    if(cursor.rowcount > 0):
        return jsonify({"message" : "Email/User already exists"}), 409
    else:
        return jsonify({"message" : "Email is good for use"}), 200
    
@registrationPageData.route("/registerPatient", methods=['POST'])
def registerPatientFunc():
    try:
        fname = request.json.get('fname')
        lname = request.json.get('lname')
        fullname = fname + ' ' + lname
        email = request.json.get('email')
        password = request.json.get('password')

        #   SET INSURANCE VARIABLE TO NULL IF EMPTY
        insuranceCompany = request.json.get('company')
        insuranceID = request.json.get('insuranceId')
        insuranceTier = request.json.get('tier')

        weight = request.json.get('weight')
        height = request.json.get('height')
        calories = request.json.get('calories')
        water = request.json.get('water')
        exercise = request.json.get('exercise')
        sleep = request.json.get('sleep')
        energy = request.json.get('energy')
        stress = request.json.get('stress')

        cursor = mysql.connection.cursor()
        cursor.execute('''
                INSERT INTO users (userName, email, pass, userType)
                VALUES (%s, %s, %s, 'Patient')
                ''', (fullname, email, password))
        mysql.connection.commit()

        #   Retrive userID of newly created user
        cursor.execute("SELECT userID FROM users WHERE email LIKE %s AND pass LIKE %s", (email, password))
        data = cursor.fetchone()
        userID = data[0]

        #   Check if user inputted Insurance Information
        if insuranceCompany and insuranceID and insuranceTier:
            cursor.execute('''
                    INSERT INTO patients (userID, insuranceCompany, insuranceID, insuranceTier)
                    VALUES (%s, %s, %s, %s)
                    ''', (userID, insuranceCompany, insuranceID, insuranceTier))
        else:
            cursor.execute('INSERT INTO patients (userID) VALUES (%s)', (userID, ))
        mysql.connection.commit()

        #   Retrive patientID of newly created user
        cursor.execute("SELECT patientID FROM patients WHERE userID = %s", (userID,))
        data = cursor.fetchone()
        patientID = data[0]

        cursor.close()
        return jsonify({"message" : "User successfully registered", "patientID" : patientID}), 200
    except Exception as err:
        return {"error":  f"{err}"}
    
@registrationPageData.route("/registerTherapist", methods=['POST'])
def registerTherapistFunc():
    try:
        fname = request.json.get('fname')
        lname = request.json.get('lname')
        fullname = fname + ' ' + lname
        email = request.json.get('email')
        password = request.json.get('password')
        license = request.json.get('license')
        specsArray = ','.join(request.json.get('specializations'))
        content = '{"survey" : [{"question": "How was your day?", "questionType": "string"}, {"question": "How much do you weigh in pounds?", "questionType": "number"}, {"question": "Did you eat today", "questionType": "boolean"}, {"question": "How much do you look forward to tomorrow?", "questionType": "range10"}]}'

        cursor = mysql.connection.cursor()
        cursor.execute('''
                INSERT INTO users (userName, email, pass, userType)
                VALUES (%s, %s, %s, 'Therapist')
                ''', (fullname, email, password))
        mysql.connection.commit()

        #   Retrive userID of newly created user
        cursor.execute("SELECT userID FROM users WHERE email LIKE %s AND pass LIKE %s", (email, password))
        data = cursor.fetchone()
        userID = data[0]
        print(userID)
        print(license)
        print(specsArray)

        cursor.execute('''
                INSERT INTO therapists (userID, licenseNumber, specializations, acceptingPatients, content)
                VALUES (%s, %s, %s, %s, %s)
                ''', (userID, license, specsArray, 1, content))
        mysql.connection.commit()

        #   Retrive therapistID of newly created user
        cursor.execute("SELECT therapistID FROM therapists WHERE userID = %s", (userID,))
        data = cursor.fetchone()
        therapistID = data[0]

        cursor.close()

        return jsonify({"message" : "User successfully registered", "therapistID" : therapistID}), 200
    except Exception as err:
        return {"error":  f"{err}"}