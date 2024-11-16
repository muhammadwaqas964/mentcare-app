import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { DashboardCard, DashboardCardTitleless } from '../components/DashboardCards.js';
import './styles/TherapistDashboard.css'

const socket = io('http://localhost:5000');

function TherapistDashboard() {
    const [acceptingStatus, setAcceptingStatus] = useState();
    const [surveyQuestions, setSurveyQuestions] = useState([{ "question": "Loading Questions", "questionType": "Loading" }]);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        console.log("USER ID: ", userId);

        fetch('http://localhost:5000/therapistDashboardData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }), // Send userId in the body
        })
            .then(res => res.json())
            .then(data => {
                setSurveyQuestions(JSON.parse(data.survey));
                setAcceptingStatus(data.accepting);
                console.log(JSON.parse(data.survey));
            })
            .catch(err => console.error('Error fetching data:', err));

        // Listen for new feedback from therapist
        // socket.on('new-feedback', (newFeedback) => {

        // });

        // Listen for new surveys from therapist
        // socket.on('new-survey', (newSurvey) => {

        // });

        // Cleanup on component unmount
        // return () => {
        //     socket.off('new-feedback');
        //     socket.off('new-survey');
        // };
    }, []); // TODO: Add to "[]" so the patients list auto-updates upon new patient adding themself! (Socket.io?)

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        console.log("User ID: ", userId);

        fetch('http://localhost:5000/therapistsPatientsList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }), // Send userId in the body
        })
            .then(res => res.json())
            .then(data => {
                console.log(data.patientData);
                setPatients(data.patientData);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []); // TODO: Add to "[]" so the patients list auto-updates upon new patient adding themself! (Socket.io?)

    const changeAcceptance = () => {
        const userId = localStorage.getItem("userID");

        fetch('http://localhost:5000/therapistsAcceptingStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, acceptingStatus }), // We send the current value of acceptingStatus to the backend
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.inserted === 1) {
                    setAcceptingStatus(data.accepting); // We read the new value of acceptingStatus from the backend
                }
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    return (
        <>
            <table style={{ width: '100%' }}>
                <tr>
                    <td style={{ width: '50%' }}>
                        <div className="flex-row flex-centered main-container">
                            <div className="">
                                <DashboardCardTitleless extraClasses="margined">
                                    <p onClick={() => changeAcceptance()}>{acceptingStatus ? "START" : "STOP"} ACCEPTING PATIENTS</p>
                                </DashboardCardTitleless>
                                <DashboardCard title="Your Survey Questions" extraClasses="margined">
                                    {surveyQuestions.map((item, index) => (
                                        <p> {item.question} (Type: {item.questionType}) </p>
                                    ))}
                                </DashboardCard>
                            </div>
                        </div>
                    </td>
                    <td style={{ width: '50%' }}>
                        <h1 style={{ textAlign: 'center' }}>Active Patients</h1>
                        <div className="flex-row flex-centered main-container">
                            <div className="">
                                {patients && patients.map((item, index) => (
                                    <DashboardCardTitleless extraClasses="margined">
                                        <p>Name: {item[0]}</p><p>FB: {item[1]}</p>
                                    </DashboardCardTitleless>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </>
    );
}

export default TherapistDashboard;