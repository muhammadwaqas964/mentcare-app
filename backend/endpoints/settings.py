from flask import request, jsonify, json, Blueprint #,render_template, request
from app import mysql

settingsPageData = Blueprint('settingsPageData', __name__)

@settingsPageData.route('/settingsAccountData', methods=['POST'])
def settingsPageDataFunc():
    try:
        userId = request.json.get('userId')
        userType = request.json.get('userType')

        cursor = mysql.connection.cursor()

        if userType == "Patient":
            cursor.execute(f'''
                SELECT users.userName, users.email
                FROM users, patients
                WHERE patients.patientID = {userId}
                AND patients.userID = users.userID
                ''') # TODO: add getting pfp to this
        elif userType == "Therapist":
            cursor.execute(f'''
                SELECT users.userName, users.email
                FROM users, therapists
                WHERE therapists.therapistID = {userId}
                AND therapists.userID = users.userID
                ''') # TODO: add getting pfp to this
        else:
            return jsonify({"userName" : "Unknown UserType", "email" : "Unknown UserType", "pfp" : "Not Yet Implemented" }), 200
        data = cursor.fetchall()
        cursor.close()
        
        return jsonify({"userName" : data[0][0], "email" : data[0][1], "pfp" : "Not Yet Implemented" }), 200
    except Exception as err:
        return {"error":  f"{err}"}

@settingsPageData.route('/settingsUpdDetails', methods=['POST'])
def settingsUpdDetailsFunc():
    try:
        userId = request.json.get('userId')
        userType = request.json.get('userType')
        newName = request.json.get('userNameUpd')
        newEmail = request.json.get('emailUpd')
        newPFP = request.json.get('pfpUpd')

        cursor = mysql.connection.cursor()
        if userType == "Patient":
            cursor.execute(f'''
                UPDATE users, patients
                SET users.userName = "{newName}", users.email = "{newEmail}"
                WHERE users.userID = patients.userID AND patients.patientID = {userId};
                ''') # TODO: add getting pfp to this
        elif userType == "Therapist":
            cursor.execute(f'''
                UPDATE users, therapists
                SET users.userName = "{newName}", users.email = "{newEmail}"
                WHERE users.userID = therapists.userID AND therapists.therapistID = {userId};
                ''') # TODO: add getting pfp to this
        else:
            cursor.close()
            return jsonify({"inserted" : -1}), 200
        mysql.connection.commit()
        if(cursor.rowcount > 0): # We ensure the table was modified
            cursor.close()
            return jsonify({"inserted" : 1}), 200
        else:
            cursor.close()
            return jsonify({"inserted" : 0}), 200
    except Exception as err:
        return {"error":  f"{err}"}

@settingsPageData.route('/settingsUpdPrivacy', methods=['POST'])
def settingsUpdPrivacyFunc():
    try:
        userId = request.json.get('userId')
        newPrivacy = request.json.get('patientPrivacy')

        cursor = mysql.connection.cursor()
        
        cursor.execute(f'UPDATE patients SET allRecordsViewable = {newPrivacy} WHERE patientID = {userId};')
        mysql.connection.commit()
        if(cursor.rowcount > 0): # We ensure the table was modified
            cursor.close()
            return jsonify({"inserted" : 1}), 200
        else:
            cursor.close()
            return jsonify({"inserted" : 0}), 200
    except Exception as err:
        return {"error":  f"{err}"}