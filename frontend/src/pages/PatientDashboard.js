import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DashboardCard from '../components/DashboardCard.js';
import './styles/PatientDashboard.css'

const socket = io('http://localhost:5000');

function PatientDashboard() {
    const [journals, setJournals] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        const patientId = localStorage.getItem("userID");
        console.log("Patient ID: ", patientId)

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

    function displayJournal(e) {
        const divParent = e.target.parentElement;
        divParent.children[1].className = 'visible popUp';
    }

    function hideJournal(e) {
        const divParent = e.target.parentElement.parentElement;
        divParent.className = 'hidden popUp';
    }

    return (
        <div>
            <h1>Welcome to your Patient Dashboard</h1>
            {/* Display patient-specific content */}

            <div className="cards-container">
                <DashboardCard title="Journals">
                    {journals && journals.map((row, index) => {
                        return (
                            <div key={index}>
                                <input type='button' value={'Journal'} onClick={(e) => displayJournal(e)}></input>
                                <div className='hidden popUp'>
                                    <h2>Journal Entry #n</h2>
                                    <h3>Date: ##/##/##</h3>
                                    <textarea defaultValue={row.journalEntry}></textarea>
                                    <div>
                                        <input type='button' value={'CANCEL'} onClick={(e) => hideJournal(e)}></input>
                                        <input type='button' value={'SAVE'}></input>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DashboardCard>
            </div>
        </div>
    );
}

export default PatientDashboard;