# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file from the root directory into the container at /app/
COPY ../requirements.txt /app/

# Copy the backend directory from the root into the container
COPY ../backend /app/backend

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 5000 for Flask
EXPOSE 5000

# Define environment variable for Flask
ENV FLASK_APP=app.py

# Run Flask when the container launches
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
