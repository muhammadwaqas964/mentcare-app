import pytest, json
from app import *

def test_sendTestimonial():
    response = app.test_client().post('/sendTestimonial', json={
        "userId": 1,
        "content": "Wow good website!",
    })

    assert response.status_code == 200
    assert "Success" == json.loads(response.data.decode("utf-8"))["message"]

    response = app.test_client().post('/sendTestimonial', json={
        "userId": -1,
        "content": "Wow good website!",
    })
    print(response.data)
    assert response.status_code == 500
    assert "(1452, \'Cannot add or update a child row: a foreign key constraint fails (`health`.`testimonials`, CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`))\')" == json.loads(response.data.decode("utf-8"))["error"]

def test_getTestimonials():
    response = app.test_client().get('/getTestimonials')
    print(response.data)
    assert response.status_code == 200