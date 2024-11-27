from flask import request, Flask, jsonify, json, Blueprint #,render_template, request
from app import mysql
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# Feel free to add more imports above

landingPageData = Blueprint('landingPageData', __name__)

# these endpoints heed to have unique names across the entire app (i.e there can only be one "/testimonials" anywhere)
@landingPageData.route('/testimonials')
def index():
    cursor = mysql.connection.cursor()
    # Fetching combined data of users and their testimonials
    cursor.execute("""
        SELECT Users.Username, Testimonials.Content
        FROM Users
        JOIN Testimonials ON Users.UserID = Testimonials.UserID
    """)
    testimonials = cursor.fetchall()
    
    cursor.close()
    
    # Format the data into a list of dictionaries
    formatted_testimonials = [
        {"Username": row[0], "Content": row[1]} for row in testimonials
    ]
    
    return jsonify({"Testimonials": formatted_testimonials})

    