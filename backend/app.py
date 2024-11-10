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
                SELECT userType, patients.patientID FROM users
                WHERE users.email LIKE %s AND users.pass LIKE %s
                ''', (email, password))
        data = cursor.fetchone()
        if data:
            user_type = data[0]  # Access the first (and only) column in the row
            return jsonify({"userType": user_type})
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