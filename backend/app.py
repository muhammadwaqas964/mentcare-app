from flask import Flask, request, jsonify, send_file
from flask_mysqldb import MySQL
from flask_cors import CORS
from flask_socketio import SocketIO
from flasgger import Swagger
from io import BytesIO

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

# MySQL Configuration
app.config['MYSQL_HOST'] = 'mysql'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root_password'
app.config['MYSQL_DB'] = 'cs490_GP'
mysql = MySQL(app)

# Swagger Configuration
swagger = Swagger(app)

# SocketIO Connections
sockets = {}
socketsNavbar = {}

@app.route("/api/login", methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE email=%s AND password=%s', (email, password))
        user = cursor.fetchone()
        cursor.close()
        if user:
            return jsonify(success=True), 200
        else:
            return jsonify(success=False, message='Invalid credentials'), 401
    except Exception as err:
        return jsonify(error=str(err)), 500

@app.route("/navbarData", methods=['POST'])
def navbarDataFunc():
    try:
        fakeUserId = request.json.get('fakeUserID')
        userType = request.json.get('userType')
        totalResults = []

        cursor = mysql.connection.cursor()

        if userType == 'Patient':
            cursor.execute('''
                SELECT users.userID, userName, userType FROM users
                INNER JOIN patients ON users.userID = patients.userID
                WHERE patients.patientID = %s
            ''', (fakeUserId, ))
        elif userType == 'Therapist':
            cursor.execute('''
                SELECT users.userID, userName, userType FROM users
                INNER JOIN therapists ON users.userID = therapists.userID
                WHERE therapists.therapistID = %s
            ''', (fakeUserId, ))

        data = cursor.fetchall()
        if data:
            columns = [column[0] for column in cursor.description]
            results = [dict(zip(columns, row)) for row in data]
            totalResults.append(results)

            userId = results[0]['userID']
            cursor.execute('SELECT notificationID, message, redirectLocation FROM notifications WHERE userID = %s', (userId,))
            notifs_data = cursor.fetchall()

            if notifs_data:
                notifs_columns = [column[0] for column in cursor.description]
                notifs_results = [dict(zip(notifs_columns, row)) for row in notifs_data]
                totalResults.append(notifs_results)
            else:
                totalResults.append(None)

            return jsonify(totalResults), 200
        else:
            return jsonify(message="User not found"), 404
    except Exception as err:
        return jsonify(error=str(err)), 500

@app.route("/retriveProfilePic", methods=['POST'])
def retriveProfilePicFunc():
    try:
        realUserID = request.json.get('realUserID')
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT profileImg FROM users WHERE userID = %s', (realUserID,))
        data = cursor.fetchone()

        if data and data[0]:
            return jsonify(profileImg=data[0]), 200
        else:
            return jsonify(error="Profile image is null"), 404
    except Exception as err:
        return jsonify(error=str(err)), 500

@app.route("/deleteNotification", methods=['POST'])
def delNotifFunc():
    try:
        notificationID = request.json.get('notificationID')
        cursor = mysql.connection.cursor()
        cursor.execute('DELETE FROM notifications WHERE notificationID = %s', (notificationID,))
        mysql.connection.commit()
        cursor.close()

        return jsonify(message="Notification successfully deleted!"), 200
    except Exception as err:
        return jsonify(error=str(err)), 500

@socketio.on('init-socket-comm')
def initializeSocketCommunication(data):
    userId = data.get('userID')
    socketId = request.sid
    sockets[userId] = socketId
    print(f"Added socketId {socketId} for userId {userId}")

@socketio.on('rem-socket-comm')
def removeSocketCommunication(data):
    userId = data.get('userID')
    if userId in sockets:
        sockets.pop(userId)
        print(f"Removed socketId for userId {userId}")

@app.route("/routes")
def list_routes():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        url = urllib.parse.unquote(f"{rule.endpoint}: {methods} {rule}")
        output.append(url)
    return '<br>'.join(output)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
