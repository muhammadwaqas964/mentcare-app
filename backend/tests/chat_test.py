import pytest, json
from app import *

def test_getCharging():
    response = app.test_client().post('/getCharging', json={
        "therapistId": 1,
    })
    assert response.status_code == 200
    print(response.data)
    assert 20 == json.loads(response.data.decode("utf-8"))[0][0]

# @pytest.mark.parametrize(
#  ("userIdToTest", "userTypeToTest", "oppositeRole"),
#  (
#   (1, "patient", "therapist"),
#   (2, "therapist", "patient"),
#   # add more here
#  ),
# )
def test_userChats():
    response = app.test_client().post('/userChats', json={
        "chooseId": 1,
        "userType": "Therapist",
    })
    assert response.status_code == 200
    print(response.data)
    assert 'Inactive' == json.loads(response.data.decode("utf-8"))[0]["chatStatus"]
    assert  json.loads(response.data.decode("utf-8"))[0]['content']
    assert 'Inactive' == json.loads(response.data.decode("utf-8"))[0]["requestStatus"]
    assert 1 == json.loads(response.data.decode("utf-8"))[0]["patientID"]
    assert "John Smith" == json.loads(response.data.decode("utf-8"))[0]["patientName"]

    response = app.test_client().post('/userChats', json={
        "chooseId": 1,
        "userType": "Patient",
    })
    assert response.status_code == 200
    print(response.data)
    assert 'Inactive' == json.loads(response.data.decode("utf-8"))[0]["chatStatus"]
    assert  json.loads(response.data.decode("utf-8"))[0]['content']
    assert 'Inactive' == json.loads(response.data.decode("utf-8"))[0]["requestStatus"]
    assert 'Active' == json.loads(response.data.decode("utf-8"))[0]["status"]
    assert 1 == json.loads(response.data.decode("utf-8"))[0]["therapistID"]
    assert "Linda White" == json.loads(response.data.decode("utf-8"))[0]["therapistName"]

def test_startChat():
    response = app.test_client().post('/startChat', json={
        "patientId": 1,
        "therapistId": 1,
    })
    assert response.status_code == 200
    print(response.data)
    assert "Chat started successfully!" == json.loads(response.data.decode("utf-8"))["message"]

    response = app.test_client().post('/startChat', json={
        "patientId": -1,
        "therapistId": -1,
    })
    assert response.status_code == 500
    print(response.data)
    assert "\'NoneType\' object is not subscriptable" == json.loads(response.data.decode("utf-8"))["error"]

def test_endChat():
    response = app.test_client().post('/endChat', json={
        "patientId": 1,
        "therapistId": 1,
    })
    assert response.status_code == 200
    print(response.data)
    assert "Chat ended successfully!" == json.loads(response.data.decode("utf-8"))["message"]

    response = app.test_client().post('/endChat', json={
        "patientId": -1,
        "therapistId": -1,
    })
    assert response.status_code == 500
    print(response.data)
    assert "\'NoneType\' object is not subscriptable" == json.loads(response.data.decode("utf-8"))["error"]

def test_requestChat():
    response = app.test_client().post('/requestChat', json={
        "patientId": 1,
        "therapistId": 1,
    })
    assert response.status_code == 200
    print(response.data)
    assert "Requested" == json.loads(response.data.decode("utf-8"))["message"]

    response = app.test_client().post('/requestChat', json={
        "patientId": -1,
        "therapistId": -1,
    })
    assert response.status_code == 500
    print(response.data)
    assert "\'NoneType\' object is not subscriptable" == json.loads(response.data.decode("utf-8"))["error"]

def test_sendMessage():
    response = app.test_client().post('/sendMessage', json={
        "patientId": 1,
        "therapistId": 1,
        "message": "Helllo",
        "sender": "P",
    })
    assert response.status_code == 200
    print(response.data)
    assert "Success" == json.loads(response.data.decode("utf-8"))["message"]