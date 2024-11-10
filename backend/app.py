from flask import Flask, request, jsonify #,render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
app = Flask(__name__)
CORS(app, origins="http://localhost:3000")
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

sockets = {}

app.config['MYSQL_HOST'] = 'localhost'
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "@ElPolloMan03"
app.config["MYSQL_DB"] = "cs490_GP"

mysql = MySQL(app)

@app.route("/")
def defaultFunc():
    return {"status": "Backend is alive"}

@app.route("/patientOrTherapist", methods=['POST'])
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
                userID = data[0]
            
            #   userID ( NOT THE SAME AS user_id, im just bad at naming), is used to send the patient/therapist id
            #   back to client, no matter if patient or therapist
            return jsonify({"userType": user_type, "userID": userID})
        else:
            return jsonify({"error": "No user found with the given email and password"}), 404
    except Exception as err:
        return {"error":  f"{err}"}
    
@app.route("/patientDashboardData", methods=['POST'])
def patientDashFunc():
    try:
        patientId = request.json.get('patientId')
        print(patientId)
        cursor = mysql.connection.cursor()
        cursor.execute('''
                SELECT journalEntry FROM journals WHERE journals.patientID = %s
                ''', (patientId, ))
        data = cursor.fetchall()
        print(data)
        if data:
            columns = [column[0] for column in cursor.description]
            results = [dict(zip(columns, row)) for row in data]
            cursor.close()
            return jsonify(results)
        else:
            return jsonify({"error": "No user found with the given email and password"}), 404
    except Exception as err:
        return {"error":  f"{err}"}