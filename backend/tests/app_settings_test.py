import pytest
from unittest import mock
from app import *

# # Test backend is online
# @mock.patch("flask_mysqldb.MySQL.connection", autospec=True)
# def test_patientDashFunc(mock_connection):
#     mock_cursor = mock.MagicMock()
#     mock_connection.cursor.return_value = mock_cursor
#     mock_cursor.rowcount = 0
#     mock_cursor.execute.return_value = 0
#     mock_cursor.fetchall.return_value = False
#     mock_cursor.fetchone.return_value = False

#     response = app.test_client().post('/patientDashboardData', json={
#         "patientId" : 1
#     })

#     assert response.status_code == 200
#     assert b"journalEntry" in response.data
#     assert b"exercise" in response.data
#     assert b"height" in response.data
#     assert b"sleep" in response.data
#     assert b"stress" in response.data
#     assert b"water" in response.data
#     assert b"weight" in response.data
#     assert b"energy" in response.data
#     assert b"calories" in response.data