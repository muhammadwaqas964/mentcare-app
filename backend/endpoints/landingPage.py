from flask import request, Flask, jsonify, json, Blueprint #,render_template, request
from app import mysql

landingPageData = Blueprint('landingPageData', __name__)

# Fetch testimonials
@landingPageData.route('/testimonials', methods=['GET'])
def get_testimonials():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT users.userName, testimonials.content
            FROM users
            JOIN testimonials ON users.userID = testimonials.userID
        """)
        testimonials = cursor.fetchall()
        cursor.close()
        formatted_testimonials = [
            {"Username": row[0], "Content": row[1]} for row in testimonials
        ]
        return jsonify({"Testimonials": formatted_testimonials})
    except Exception as err:
        return {"error": f"{err}"}

# Fetch mission statement and FAQs
@landingPageData.route('/companydata', methods=['GET'])
def get_data():
    try:
        cursor = mysql.connection.cursor()
        
        # Fetch mission statement
        cursor.execute("SELECT statement FROM mission LIMIT 1")
        mission = cursor.fetchone()

        # Fetch FAQs
        cursor.execute("SELECT question, answer FROM company")
        faqs = cursor.fetchall()
        
        cursor.close()

        # Format data
        response = {
            "Mission": mission[0] if mission else "No mission statement available.",
            "FAQs": [{"Question": row[0], "Answer": row[1]} for row in faqs]
        }
        return jsonify(response)
    except Exception as err:
        return {"error": f"{err}"}
