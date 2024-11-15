import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { DashboardCard, DashboardCardTitleless } from '../components/DashboardCards.js';
import './styles/TherapistDashboard.css'

const socket = io('http://localhost:5000');

function TherapistDashboard() {
    const [acceptingStatus, setAcceptingStatus] = useState(true);
    const [surveyQuestions, setSurveyQuestions] = useState([{ "question": "Loading Questions", "questionType": "Loading" }]);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const userId = localStorage.getItem("userID");

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
                setAcceptingStatus(JSON.parse(data.accepting));
                console.log(JSON.parse(data.survey));
                console.log(JSON.parse(data.accepting));
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

        fetch('http://localhost:5000/therapistsAcceptingStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, acceptingStatus }),
        })
            .then(res => res.json())
            .then(data => {
                // setAcceptingStatus(JSON.parse(data.accepting));
                console.log(data);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, [acceptingStatus]);

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        console.log("User ID: ", userId);

        fetch('http://localhost:5000/therapistsPaitentsList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }), // Send userId in the body
        })
            .then(res => res.json())
            .then(data => {
                setPatients(data.patientData);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []); // TODO: Add to "[]" so the patients list auto-updates upon new patient adding themself! (Socket.io?)

    return (
        <>
            <table style={{ width: '100%' }}>
                <tr>
                    <td style={{ width: '50%' }}>
                        <div className="flex-row flex-centered main-container">
                            <div className="">
                                <DashboardCardTitleless extraClasses="margined">
                                    <p onClick={() => setAcceptingStatus(!acceptingStatus)}>{acceptingStatus ? "START" : "STOP"} ACCEPTING PATIENTS</p>
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
                                {patients.map((item, index) => (
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