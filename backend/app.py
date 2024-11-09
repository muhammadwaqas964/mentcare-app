from flask import Flask, request, jsonify #,render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
app = Flask(__name__)
CORS(app)

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
                SELECT userType FROM users WHERE users.email LIKE %s AND users.pass LIKE %s
                ''', (email, password))
        data = cursor.fetchone()
        if data:
            user_type = data[0]  # Access the first (and only) column in the row
            return jsonify({"userType": user_type})
        else:
            return jsonify({"error": "No user found with the given email and password"}), 404
    except Exception as err:
        return {"error":  f"{err}"}