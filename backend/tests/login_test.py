import pytest, json
from app import *

def test_patientOrTherapist():
    response = app.test_client().post('/patientOrTherapist', json={
        "email": "john.smith@example.com",
        "password": "password123",
    })
    assert response.status_code == 200
    print(response.data)
    assert 0 == json.loads(response.data.decode("utf-8"))["isActive"]
    assert 1 == json.loads(response.data.decode("utf-8"))["realUserID"]
    assert 1 == json.loads(response.data.decode("utf-8"))["userID"]
    assert "Patient" == json.loads(response.data.decode("utf-8"))["userType"]