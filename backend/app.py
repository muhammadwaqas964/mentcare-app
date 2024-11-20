from flask import Flask, request, jsonify, json #,render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
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
                    SELECT JSON_EXTRACT(content, '$.survey') AS survey FROM surveys
                    WHERE therapistID = %s AND patientID = %s;
                ''', (therapistId, patientId ))
            incomp_surveys_data = cursor.fetchall()
            if (incomp_surveys_data):
                incomp_surveys_columns = [column[0] for column in cursor.description]
                incomp_surveys_results = [dict(zip(incomp_surveys_columns, row)) for row in incomp_surveys_data]
                #print(therap_surveys_results)
                totalResults.append(incomp_surveys_results)

        
        #   Extract complete therapist surveys (if exists)
        cursor.execute('''
                SELECT JSON_EXTRACT(questions, '$.survey') AS questions, JSON_EXTRACT(answers, '$.answers') AS answers, dateDone FROM completedSurveys
                WHERE patientID = %s
                ''', (patientId, ))
        comp_surveys_data = cursor.fetchall()
        if comp_surveys_data:
            comp_surveys_columns = [column[0] for column in cursor.description]
            comp_surveys_results = [dict(zip(comp_surveys_columns, row)) for row in comp_surveys_data]
            totalResults.append(comp_surveys_results)

        #   Extract invoices (if exists):
        cursor.execute('''
                SELECT users.userName, invoices.amountDue, invoices.dateCreated FROM invoices
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
        cursor.execute(f'SELECT content -> "$.survey" AS surveyData FROM surveys WHERE therapistID = {userId}')
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
        cursor.execute('UPDATE surveys SET content = %s WHERE therapistID = %s', (surveyData, therapistId))
        mysql.connection.commit()
        if(cursor.rowcount > 0): # We ensure the table was modified
            cursor.close()
            return jsonify({"inserted": True}), 200
        else:
            cursor.close()
            return jsonify({"inserted": False}), 200
    except Exception as err:
        return jsonify({"error":  f"{err}"})

@app.route("/userChats", methods=['POST'])
def get_user_chats():
    try:
        choose_id = request.json.get('chooseId')
        user_type = request.json.get('userType')

        cursor = mysql.connection.cursor()

        if user_type == "Therapist":
            cursor.execute('''
                SELECT p.patientID, u.userName AS patientName, c.content
                FROM patients p
                INNER JOIN therapistPatientsList tpl ON p.patientID = tpl.patientID
                INNER JOIN users u ON p.userID = u.userID
                INNER JOIN chats c ON tpl.patientID = c.patientID AND tpl.therapistID = c.therapistID
                WHERE tpl.therapistID = %s AND tpl.status = 'Active'
            ''', (choose_id,))
        else:
            cursor.execute('''
                SELECT t.therapistID, u.userName AS therapistName, c.content
                FROM therapists t
                INNER JOIN therapistPatientsList tpl ON t.therapistID = tpl.therapistID
                INNER JOIN users u ON t.userID = u.userID
                INNER JOIN chats c ON tpl.patientID = c.patientID AND tpl.therapistID = c.therapistID
                WHERE tpl.patientID = %s AND tpl.status = 'Active'
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

