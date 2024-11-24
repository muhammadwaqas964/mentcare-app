from flask import Flask, request, jsonify, json, send_file #,render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from datetime import datetime
from io import BytesIO
app = Flask(__name__)
CORS(app, origins="http://localhost:3000")
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000", methods=["GET", "POST", "OPTIONS"])

sockets = {}

app.config['MYSQL_HOST'] = 'localhost'
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "@ElPolloMan03"
app.config["MYSQL_DB"] = "cs490_GP"

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

            cursor.execute('''
                    SELECT notificationID, message, redirectLocation FROM notifications WHERE userID = %s
                    ''', (userId, ))
            notifs_data = cursor.fetchall()
            if notifs_data:
                notifs_columns = [column[0] for column in cursor.description]
                notifs_results = [dict(zip(notifs_columns, row)) for row in notifs_data]
                totalResults.append(notifs_results)
            else:
                totalResults.append(None)
            
            return jsonify(totalResults)
        else:
            return jsonify({"message" : "User not found"}), 404

    except Exception as err:
        return {"error":  f"{err}"}
    
@app.route('/retriveProfilePic', methods=['POST'])
def retriveProfilePicFunc():
    try:
        realUserID = request.json.get('realUserID')
        cursor = mysql.connection.cursor()
        cursor.execute('''
            SELECT profileImg FROM users
            WHERE userID = %s
        ''', (realUserID,))

        data = cursor.fetchall()
        if data:
            profile_img_data = data[0][0]
        
            if profile_img_data:
                img_stream = BytesIO(profile_img_data)
                return send_file(img_stream, mimetype='image/jpeg')
            else:
                return jsonify({"error": "Profile image not found"}), 404
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as err:
        return {"error":  f"{err}"}
    
@app.route('/deleteNotification', methods=['POST'])
def delNotifFunc():
    try:
        notificationID = request.json.get('notificationID')

        cursor = mysql.connection.cursor()
        cursor.execute('''
                    DELETE FROM notifications WHERE notificationID = %s
                    ''', (notificationID, ))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message" : "Notification succesfully delete!"}), 200
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
    print("CURRENT SOCKETS CONNECTIONS: ", sockets)
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



#   CHAT PAGE CODE DOWN HERE
@app.route('/startChat', methods=['POST'])
def startChatFunc():
    try:
        patientID = request.json.get('patientId')
        print(sockets)
        print(patientID)

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT userID FROM patients WHERE patientID = %s', (patientID, ))
        data = cursor.fetchone()
        userID = data[0]

        # Emit the event to the connected socket clients
        socketio.emit('start-chat-for-patient', {
            'message':'active'
        }, room=sockets[str(userID)])

        return jsonify({"message": "Chat started successfully!"}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
@app.route('/endChat', methods=['POST'])
def endChatFunc():
    try:
        patientID = request.json.get('patientId')
        print("IN END CHAT")
        print(sockets)
        print(patientID)

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT userID FROM patients WHERE patientID = %s', (patientID, ))
        data = cursor.fetchone()
        userID = data[0]

        # Emit the event to the connected socket clients
        socketio.emit('end-chat-for-patient', {
            'message':'inactive'
        }, room=sockets[str(userID)])

        return jsonify({"message": "Chat ended successfully!"}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
@app.route('/requestChat', methods=['POST'])
def requestChatFunc():
    try:
        therapistID = request.json.get('therapistId')
        print("Request chat'")
        print(sockets)
        print(therapistID)

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT userID FROM therapists WHERE therapistID = %s', (therapistID, ))
        data = cursor.fetchone()
        userID = data[0]

        # Emit the event to the connected socket clients
        socketio.emit('request-chat', {
            'message':'active'
        }, room=sockets[str(userID)])

        return jsonify({"message": "Requested"}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
@app.route("/sendMessage", methods=['POST'])
def send_message():
    try:

        patient_id = request.json.get('patientId')
        therapist_id = request.json.get('therapistId')
        message = request.json.get('message')
        sender = request.json.get('sender')

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT content FROM chats WHERE patientID = %s AND therapistID = %s', (patient_id, therapist_id))
        chat_data = cursor.fetchone()

        if chat_data:
            try:
                content = json.loads(chat_data[0])
                if "chats" not in content:
                    raise ValueError("Err Json")
            except Exception as e:
                return jsonify({"error": f"Err: {str(e)}"}), 500

            content['chats'].append({"msg": message, "sender": sender})

            cursor.execute(
                'UPDATE chats SET content = %s WHERE patientID = %s AND therapistID = %s',
                (json.dumps(content), patient_id, therapist_id)
            )
        else:
            new_content = {"chats": [{"msg": message, "sender": sender}]}
            cursor.execute(
                'INSERT INTO chats (patientID, therapistID, content, startTime) VALUES (%s, %s, %s, %s)',
                (patient_id, therapist_id, json.dumps(new_content), datetime.now())
            )

        mysql.connection.commit()
        cursor.close()

        if sender == 'P':
            cursor = mysql.connection.cursor()
            cursor.execute('SELECT userID FROM therapists WHERE therapistID = %s', (therapist_id, ))
            data = cursor.fetchone()
            userID = data[0]
        else:
            cursor = mysql.connection.cursor()
            cursor.execute('SELECT userID FROM patients WHERE patientID = %s', (patient_id, ))
            data = cursor.fetchone()
            userID = data[0]
        print(userID)
        print(therapist_id)
        print(sender)
        print(message)
        print(patient_id)
        room = sockets[str(userID)]
        print(room)
        socketio.emit('new-message', { 'patientId': patient_id, 'therapistId': therapist_id, 'message': message, 'sender': sender }, room=room)
        print("New message sent to room " + room + " - " + message)

        return jsonify({"message": "Success"}), 200

    except Exception as err:
        return jsonify({"error": str(err)}), 500


