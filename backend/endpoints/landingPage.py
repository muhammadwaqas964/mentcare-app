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

@app.route('/testimonials')
def index():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Fetching combined data of users and their testimonials
    cursor.execute("""
        SELECT Users.Username, Testimonials.Content
        FROM Users
        JOIN Testimonials ON Users.UserID = Testimonials.UserID
    """)
    testimonials = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify({"Testimonials": testimonials})

if __name__ == '__main__':
    app.run(debug=True)
