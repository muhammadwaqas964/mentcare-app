import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { DashboardCard, DashboardCardTitleless } from '../components/DashboardCards.js';
import './styles/TherapistDashboard.css'

const socket = io('http://localhost:5000');

function TherapistDashboard() {
    const [journals, setJournals] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [acceptingStatus, setAcceptingStatus] = useState(true);

    useEffect(() => {
        const patientId = localStorage.getItem("userID");
        console.log("Patient ID: ", patientId);

        fetch('http://localhost:5000/patientDashboardData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patientId }), // Send patientId in the body
        })
            .then(res => res.json())
            .then(data => {
                console.log(data); // Log the data to inspect it
                setJournals(data); // Set the journals state with the fetched data
            })
            .catch(err => console.error('Error fetching data:', err));

        // Listen for new feedback from therapist
        socket.on('new-feedback', (newFeedback) => {
            setFeedback((prevFeedback) => [...prevFeedback, newFeedback]);
        });

        // Listen for new surveys from therapist
        socket.on('new-survey', (newSurvey) => {
            setSurveys((prevSurveys) => [...prevSurveys, newSurvey]);
        });

        // Cleanup on component unmount
        return () => {
            socket.off('new-feedback');
            socket.off('new-survey');
        };
    }, []);


    return (
        <>
            <table style={{ width: '100%' }}>
                <tr>
                    <td style={{ width: '50%' }}>
                        <div className="flex-row flex-centered main-container">
                            <div className="left-side">
                                <DashboardCardTitleless extraClasses="margined">
                                    <p>{acceptingStatus ? "START" : "STOP"} ACCEPTING PATIENTS</p>
                                </DashboardCardTitleless>
                                <DashboardCard title="Your Survey Questions" extraClasses="margined" >
                                    <p>bruh</p>
                                </DashboardCard>
                                <DashboardCard title="Your Initial Questions" extraClasses="margined">
                                    <p>bruh</p>
                                </DashboardCard>
                                <DashboardCard title="Active Patients" extraClasses="margined">
                                    <p>bruh</p>
                                </DashboardCard>
                            </div>
                        </div>
                    </td>
                    <td style={{ width: '50%' }}>
                        <div className="flex-row flex-centered main-container">
                            <div className="right-side">
                                <DashboardCardTitleless extraClasses="margined">
                                    <p>ACCEPTING PATIENTS</p>
                                </DashboardCardTitleless>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </>
    );
}

export default TherapistDashboard;