from flask import Flask, request, jsonify, json #,render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from datetime import datetime
app = Flask(__name__)
CORS(app, origins="http://localhost:3000")
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000", threaded=True)

sockets = {}

app.config['MYSQL_HOST'] = 'localhost'
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "dasaniwater"
app.config["MYSQL_DB"] = "health"

mysql = MySQL(app)

from endpoints.example import examplePageStuff
app.register_blueprint(examplePageStuff)

from endpoints.loginPage import loginPageData
app.register_blueprint(loginPageData)

from endpoints.registrationPage import registrationPageData
app.register_blueprint(registrationPageData)

from endpoints.therapistDashboard import TherapistDashboardData
app.register_blueprint(TherapistDashboardData)

# As I do not know Socket IO, I will not be completing this. I copied in everything but the Socket IO stuff.
from endpoints.patientDashboard import PatientDashboardData
app.register_blueprint(PatientDashboardData)

from endpoints.therapistProfile import TherapistProfileData
app.register_blueprint(TherapistProfileData)

from endpoints.patientProfile import PatientProfileData
app.register_blueprint(PatientProfileData)

# As I do not know Socket IO, I will not be completing this 
from endpoints.chatPage import chatPageData
app.register_blueprint(chatPageData)

from endpoints.therapistListPage import therapistListData
app.register_blueprint(therapistListData)

from endpoints.paymentPage import paymentPageData
app.register_blueprint(paymentPageData)

from endpoints.settings import settingsPageData
app.register_blueprint(settingsPageData)

@app.route("/")
def defaultFunc():
    return {"status": "Backend is alive"}

@app.route("/navbarData", methods=['POST'])
def navbarDataFunc():
    try:
        userId = request.json.get('userId')
        userType = request.json.get('userType')

        cursor = mysql.connection.cursor()

        if userType == 'Patient':
            cursor.execute('''
                    SELECT userName, userType FROM users
                    INNER JOIN patients ON users.userID = patients.userID
                    WHERE patients.patientID = %s
                    ''', (userId, ))
        elif userType == 'Therapist':
            cursor.execute('''
                    SELECT userName, userType FROM users
                    INNER JOIN therapists ON users.userID = therapists.userID
                    WHERE therapists.therapistID = %s
                    ''', (userId, ))
        data = cursor.fetchall()
        if data:
            columns = [column[0] for column in cursor.description]
            results = [dict(zip(columns, row)) for row in data]
            return jsonify(results)
        else:
            return jsonify({"message" : "User not found"}), 404

    except Exception as err:
        return {"error":  f"{err}"}

#############   BEGINNING OF SOCKETIO CODE   ############

if __name__ == '__app__':
    socketio.run(app)

@socketio.on('init-socket-comm')
def initializeSocketCommunication(data):
    #   Here, userID is NOT the actual userID from users table
    #   It is the patientID OR therapistID from patients/therapists tables
    #   I'm naming it userID because this authenticate will be used for either patient or therapist
    userId = data.get('userID')
    socketId = request.sid
    sockets[userId] = socketId
    print(f"Added socketId {socketId} for userId {userId}")

@socketio.on('rem-socket-comm')
def removeSocketCommunication(data):
    #   Here, userID is NOT the actual userID from users table
    #   It is the patientID OR therapistID from patients/therapists tables
    #   I'm naming it userID because this authenticate will be used for either patient or therapist
    userId = data.get('userID')
    if userId in sockets:
        socketId = sockets.pop(userId)
        print(f"Removed socketId {socketId} for userId {userId}")
    else:
        print(f"userId {userId} not found in sockets dictionary")

#   Received from Patient Dashboard (Patient submits daily survey)
@socketio.on('submit-daily-survey')
def dailySurveyFunc(data):
    try:
        patient_id = data.get('patientID')
        daily_survey_id = data.get('dailySurveyID')
        weight = data.get('weight')
        height = data.get('height')
        calories = data.get('calories')
        water = data.get('water')
        exercise = data.get('exercise')
        sleep = data.get('sleep')
        energy = data.get('energy')
        stress = data.get('stress')

        print("HELLO I AM HERE")
        print(f"Received Survey Data: PatientID={patient_id}, DailySurveyID={daily_survey_id}, Weight={weight}, Height={height}, etc.")

        # You can now process the received data (e.g., store it in a database, perform any logic)
        
    except Exception as err:
        print(f"Error handling socket event: {err}")

#   Sent from Patient Overview Page to a Patient's Dashboard Page
@socketio.on('send-new-feedback')
def sendFeedback(data):
    patientId = data.get('patientID')
    feedback = data.get('feedback')

    if patientId in sockets:
        socketio.emit('new-feedback', {'feedback': feedback}, room=sockets[patientId])


#   To be used for chatting (Just a basic layout)
@socketio.on('join')
def on_join(data):
    userId = data['userID']
    room = data['room']
    join_room(room)
    send(userId + ' has entered the room.', to=room)

#   To be used for chatting (Just a basic layout)
@socketio.on('leave')
def on_leave(data):
    userId = data['userID']
    room = data['room']
    leave_room(room)
    send(userId + ' has left the room.', to=room)

