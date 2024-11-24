from flask import Flask, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables CORS for all domains on all routes

def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        database='mentcare1',
        user='root',
        password='root'
    )

@app.route('/therapists')
def get_therapists():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Fetching therapists with their profile details and testimonials
    cursor.execute("""
        SELECT Users.Username, Therapists.LicenseNumber, Therapists.Specializations,
        Testimonials.Content AS Patient_Testimonial
        FROM Users
        JOIN Therapists ON Users.UserID = Therapists.UserID
        LEFT JOIN Testimonials ON Users.UserID = Testimonials.UserID
        WHERE Users.UserType = 'Therapist'
    """)
    therapists = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify({"Therapists": therapists})

if __name__ == '__main__':
    app.run(debug=True)
