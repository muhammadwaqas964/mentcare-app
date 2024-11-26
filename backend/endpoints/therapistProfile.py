from flask import request, jsonify, json, Blueprint #,render_template, request
from app import mysql
# Feel free to add more imports


TherapistProfileData = Blueprint('TherapistProfileData', __name__)

<<<<<<< Updated upstream
@TherapistProfileData.route('/endpointOne', methods=['GET'])


@TherapistProfileData.route('/therapists')
=======
# these endpoints heed to have unique names across the entire app (i.e there can only be one "/therapists" anywhere)
@TherapistProfileData.route('/therapists', methods=['GET'])
>>>>>>> Stashed changes
def get_therapists():
    cursor = mysql.connection.cursor()
    
    # Fetching therapists with their profile details and testimonials
    cursor.execute("""
        SELECT Users.Username, Therapists.Intro, Therapists.Education, Therapists.LicenseNumber, Therapists.Specializations,
        Therapists.DaysHours, Therapists.Price,
        Testimonials.Content AS Patient_Testimonial
        FROM Users
        JOIN Therapists ON Users.UserID = Therapists.UserID
        LEFT JOIN Testimonials ON Therapists.TherapistID = Testimonials.TherapistID
        WHERE Users.UserType = 'Therapist'
    """)
    therapists = cursor.fetchall()
    
    cursor.close()
    
    return jsonify({"Therapists": therapists})
    
