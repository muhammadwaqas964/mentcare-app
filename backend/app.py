from flask import Flask, request, jsonify, json #,render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from datetime import datetime
app = Flask(__name__)
CORS(app, origins="http://localhost:3000")
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

sockets = {}

app.config['MYSQL_HOST'] = 'localhost'
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "dasaniwater"
app.config["MYSQL_DB"] = "health"

mysql = MySQL(app)

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
                data = cursor.fetchone()
                userID = data[0]
            
            #   userID ( NOT THE SAME AS user_id, im just bad at naming), is used to send the patient/therapist id
            #   back to client, no matter if patient or therapist
            return jsonify({"userType": user_type, "userID": userID})
        else:
            return jsonify({"error": "No user found with the given email and password"}), 404
    except Exception as err:
        return {"error":  f"{err}"}

@app.route("/validateUserEmail", methods=['POST'])
def validateEmailFunc():
    email = request.json.get('email')
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT email FROM users WHERE email LIKE %s", (email, ))
    if(cursor.rowcount > 0):
        return jsonify({"message" : "Email/User already exists"}), 409
    else:
        return jsonify({"message" : "Email is good for use"}), 200

@app.route("/registerPatient", methods=['POST'])
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
    
@app.route("/registerTherapist", methods=['POST'])
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

@app.route("/patientDashboardData", methods=['POST'])
def patientDashFunc():
    try:
        totalResults = []
        patientId = request.json.get('patientId')
        cursor = mysql.connection.cursor()
        cursor.execute('''
                SELECT journalID, journalEntry, timeDone FROM journals WHERE patientID = %s
                ''', (patientId, ))
        data = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in data]
        totalResults.append(results)

        cursor.execute('''
                SELECT feedbackID, feedbackDate, feedback FROM feedback WHERE patientID = %s
                ''', (patientId, ))
        feedback_data = cursor.fetchall()
        feedback_columns = [column[0] for column in cursor.description]
        feedback_results = [dict(zip(feedback_columns, row)) for row in feedback_data]
        totalResults.append(feedback_results)

        #   Extract incomplete + complete daily surveys        
        cursor.execute('''
                SELECT
                    ds.dailySurveyID,
                    ds.dateCreated,
                    IFNULL(cds.weight, NULL) AS weight,
                    IFNULL(cds.height, NULL) AS height,
                    IFNULL(cds.calories, NULL) AS calories,
                    IFNULL(cds.water, NULL) AS water,
                    IFNULL(cds.exercise, NULL) AS exercise,
                    IFNULL(cds.sleep, NULL) AS sleep,
                    IFNULL(cds.energy, NULL) AS energy,
                    IFNULL(cds.stress, NULL) AS stress
                FROM dailySurveys ds
                LEFT JOIN completedDailySurveys cds
                    ON ds.dailySurveyID = cds.dailySurveyID
                WHERE (cds.dailySurveyID IS NULL)
                    OR (cds.dailySurveyID IS NOT NULL AND cds.patientID = %s)
                ''', (patientId, ))
        daily_survey_data = cursor.fetchall()
        daily_survey_columns = [column[0] for column in cursor.description]
        daily_survey_results = [dict(zip(daily_survey_columns, row)) for row in daily_survey_data]
        totalResults.append(daily_survey_results)
        
        #   Extract incomplete therapist survey (if exists)
        cursor.execute('''
                SELECT therapistID FROM therapistPatientsList WHERE patientID = %s AND status = 'Active';
                ''', (patientId, ))
        therapistId = cursor.fetchone()[0]
        if (therapistId):
            cursor.execute('''
                    SELECT users.userName, JSON_EXTRACT(surveys.content, '$.survey') AS survey, surveys.dateCreated, surveys.surveyID FROM surveys
                    INNER JOIN therapists ON surveys.therapistID = therapists.therapistID
                    INNER JOIN users ON therapists.userID = users.userID
                    WHERE surveys.therapistID = %s AND surveys.patientID = %s;
                ''', (therapistId, patientId ))
            incomp_surveys_data = cursor.fetchall()
            print("HELLO", incomp_surveys_data[0])
            if (incomp_surveys_data):
                incomp_surveys_columns = [column[0] for column in cursor.description]
                incomp_surveys_results = [dict(zip(incomp_surveys_columns, row)) for row in incomp_surveys_data]
                #print(therap_surveys_results)
                totalResults.append(incomp_surveys_results)

        
        #   Extract complete therapist surveys (if exists)
        cursor.execute('''
                SELECT users.userName, JSON_EXTRACT(completedSurveys.questions, '$.survey') AS questions,
                JSON_EXTRACT(completedSurveys.answers, '$.answers') AS answers, completedSurveys.dateDone 
                FROM completedSurveys
                INNER JOIN surveys ON completedSurveys.surveyID = surveys.surveyID
                INNER JOIN therapists ON surveys.therapistID = therapists.therapistID
                INNER JOIN users ON therapists.userID = users.userID
                WHERE completedSurveys.patientID = %s and surveys.therapistID = %s;
                ''', (patientId, therapistId))
        comp_surveys_data = cursor.fetchall()
        if comp_surveys_data:
            comp_surveys_columns = [column[0] for column in cursor.description]
            comp_surveys_results = [dict(zip(comp_surveys_columns, row)) for row in comp_surveys_data]
            totalResults.append(comp_surveys_results)

        #   Extract invoices (if exists):
        cursor.execute('''
                SELECT users.userName, invoices.invoiceID, invoices.amountDue, invoices.dateCreated FROM invoices
                INNER JOIN therapists ON invoices.therapistID = therapists.therapistID
                INNER JOIN users ON therapists.userID = users.userID
                WHERE invoices.patientID = %s;
                ''', (patientId, ))
        invoices_data = cursor.fetchall()
        if invoices_data:
            invoices_columns = [column[0] for column in cursor.description]
            invoices_results = [dict(zip(invoices_columns, row)) for row in invoices_data]
            totalResults.append(invoices_results)

        cursor.close()
        return jsonify(totalResults)
    except Exception as err:
        return {"error":  f"{err}"}
    
@app.route("/saveJournal", methods=['POST'])
def save():
    try:
        journalEntry = request.json.get('journalEntry')
        patientId = request.json.get('patientId')
        journalId = request.json.get('journalId') if request.json.get('journalId') else "null"
        print("Journal ID: " + journalId + "\n")
        cursor = mysql.connection.cursor()
        if journalId == "null":
            currentDate = datetime.now()
            print(currentDate)
            cursor.execute('''
                    INSERT INTO journals (patientID, journalEntry, timeDone)
                    VALUES (%s, %s, %s)
                    ''', (patientId, journalEntry, currentDate))
        else:
            cursor.execute('''
                    UPDATE journals
                    SET journalEntry = %s
                    WHERE patientID = %s AND journalID = %s
                    ''', (journalEntry, patientId, journalId))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message" : "Journal saved successfully"}), 200
    except Exception as err:
        return {"error":  f"{err}"}
    
@app.route("/therapistDashboardData", methods=['POST'])
def theraDashFunc():
    try:
        userId = request.json.get('userId')
        cursor = mysql.connection.cursor()
        cursor.execute(f'SELECT acceptingPatients FROM therapists WHERE therapistID = {userId}')
        data = cursor.fetchall()
        accepting = data[0][0]
        cursor.execute(f'SELECT content -> "$.survey" AS surveyData FROM therapists WHERE therapistID = {userId}')
        data = cursor.fetchall()
        cursor.close()
        return jsonify({"accepting": int(accepting), "survey" : data[0]}), 200
    except Exception as err:
        return {"error":  f"{err}"}
    
@app.route("/therapistsPatientsList", methods=['POST'])
def theraPatListFunc():
    try:
        userId = request.json.get('userId')
        cursor = mysql.connection.cursor()
        cursor.execute(f'''
                       SELECT users.userName, feedback.feedback FROM feedback
                       INNER JOIN patients ON feedback.patientID = patients.patientID
                       INNER JOIN users ON patients.userID = users.userID
                       WHERE patients.mainTherapistID = {userId}
                       ''')
        data = cursor.fetchall()
        cursor.close()
        return jsonify({"patientData" : data}), 200
    except Exception as err:
        return {"error":  f"{err}"}

@app.route("/therapistsAcceptingStatus", methods=['POST'])
def theraAcceptFunc():
    try:
        userId = request.json.get('userId')
        accepting = True if request.json.get('acceptingStatus') == 1 else False # "accepting" mirrors the value of "acceptingStatus" from the frontend
        cursor = mysql.connection.cursor()
        cursor.execute(f'''UPDATE therapists
                       SET acceptingPatients = {not accepting}
                       WHERE therapistID = {userId}''') # We flip the value of "accepting" in the MySQL query
        mysql.connection.commit()
        if(cursor.rowcount > 0): # We ensure the table was modified
            cursor.close()
            if(accepting): # If "accepting" was 1, we tell the frontend it is now 0; Vice versa
                return jsonify({"inserted": 1, "accepting" : 0}), 200
            else:
                return jsonify({"inserted": 1, "accepting" : 1}), 200
        else:
            cursor.close()
            return jsonify({"inserted": 0, "accepting" : 0}), 200
    except Exception as err:
        return {"error":  f"{err}"}
    
@app.route("/therapistUpdateSurvey", methods=['POST'])
def theraUpdSurveyFunc():
    try:
        surveyData = str(request.json.get('surveyToSubmit'))
        therapistId = request.json.get('therapistId')

        surveyData = '{"survey": ' + surveyData + '}'
        surveyData = surveyData.replace("'", '\"')

        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE therapists SET content = %s WHERE therapistID = %s', (surveyData, therapistId))
        mysql.connection.commit()
        if(cursor.rowcount > 0): # We ensure the table was modified
            cursor.close()
            return jsonify({"inserted": True}), 200
        else:
            cursor.close()
            return jsonify({"inserted": False}), 200
    except Exception as err:
        return jsonify({"error":  f"{err}"})

@app.route("/completeDailySurvey", methods=['POST'])
def sendDailySurveyFunc():
    try:
        print("GOT HERE IN APP.ROUTE")
        
        data = request.get_json()
        
        fakeUserID = data.get('fakeUserID')
        dailySurveyID = data.get('dailySurveyID')
        weight = data.get('weight')
        height = data.get('height')
        calories = data.get('calories')
        water = data.get('water')
        exercise = data.get('exercise')
        sleep = data.get('sleep')
        energy = data.get('energy')
        stress = data.get('stress')

        cursor = mysql.connection.cursor()
        cursor.execute('''
                INSERT INTO completedDailySurveys (dailySurveyID, patientID, weight, height, calories, water, exercise, sleep, energy, stress)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ''', (dailySurveyID, fakeUserID, weight, height, calories, water, exercise, sleep, energy, stress))
        mysql.connection.commit()
        cursor.close()

        # Emit the event to the connected socket clients
        socketio.emit('submit-daily-survey', {
            'patientID': fakeUserID,
            'dailySurveyID': dailySurveyID,
            'weight': weight,
            'height': height,
            'calories': calories,
            'water': water,
            'exercise': exercise,
            'sleep': sleep,
            'energy': energy,
            'stress': stress
        }, room=sockets[fakeUserID])

        return jsonify({"message": "Survey data submitted successfully!"}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

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

@app.route("/userChats", methods=['POST'])
def get_user_chats():
    try:
        choose_id = request.json.get('chooseId')
        user_type = request.json.get('userType')

        cursor = mysql.connection.cursor()

        if user_type == "Therapist":
            cursor.execute('''
                SELECT p.patientID, u.userName AS patientName, c.content, chatStatus, requestStatus
                FROM patients p
                INNER JOIN therapistPatientsList tpl ON p.patientID = tpl.patientID
                INNER JOIN users u ON p.userID = u.userID
                INNER JOIN chats c ON tpl.patientID = c.patientID AND tpl.therapistID = c.therapistID
                WHERE tpl.therapistID = %s
            ''', (choose_id,))
        else:
            cursor.execute('''
                SELECT t.therapistID, u.userName AS therapistName, c.content, chatStatus, requestStatus
                FROM therapists t
                INNER JOIN therapistPatientsList tpl ON t.therapistID = tpl.therapistID
                INNER JOIN users u ON t.userID = u.userID
                INNER JOIN chats c ON tpl.patientID = c.patientID AND tpl.therapistID = c.therapistID
                WHERE tpl.patientID = %s
            ''', (choose_id,))

        data = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in data]
        cursor.close()

        return jsonify(results), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

@app.route("/sendMessage", methods=['POST'])
def send_message():
    try:
        patient_id = request.json.get('patientId')
        therapist_id = request.json.get('therapistId')
        message = request.json.get('message')
        sender = request.json.get('sender')

        if not all([patient_id, therapist_id, message, sender]):
            return jsonify({"error": "Missing params"}), 400

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
        return jsonify({"message": "Success"}), 200

    except Exception as err:
        return jsonify({"error": str(err)}), 500

@app.route("/updateStatus", methods=['POST'])
def set_chat_status():
    try:
        patient_id = request.json.get('patientId')
        therapist_id = request.json.get('therapistId')
        status = request.json.get('status')
        type = request.json.get('type')

        cursor = mysql.connection.cursor()
        if (type == 'chat' and status == 'Active'):
            cursor.execute('UPDATE therapistpatientslist SET chatStatus = %s, requestStatus = \'Inactive\' where therapistID = %s and patientID = %s;', (status, therapist_id, patient_id))
        if (type == 'chat' and status == 'Inactive'):
            cursor.execute('UPDATE therapistpatientslist SET chatStatus = %s where therapistID = %s and patientID = %s;', (status, therapist_id, patient_id))
        elif (type == 'request'):
            cursor.execute('UPDATE therapistpatientslist SET requestStatus = %s where therapistID = %s and patientID = %s;', (status, therapist_id, patient_id))

        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Success"}), 200
    
    except Exception as err:
        return jsonify({"error": str(err)}), 500