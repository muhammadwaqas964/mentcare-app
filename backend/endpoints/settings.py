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
                FROM users
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