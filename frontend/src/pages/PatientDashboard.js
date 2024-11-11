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

    //  ---- JOURNALS FUNCTIONS START HERE ----
    function displayJournal(e, x) {
        console.log(e.target.parentElement.children[1].children.length);
        const divParent = x === 1 ? e.target.parentElement.children[1] : e.target.parentElement.children[1].children[e.target.parentElement.children[1].children.length - 1];
        divParent.className = 'visible popUp-background';
    }

    function hideJournal(e) {
        const divParent = e.target.parentElement.parentElement.parentElement;
        divParent.className = 'hidden popUp-background';
    }

    function saveJournal(e) {
        const newEntry = e.target.parentElement.parentElement.children[2];
        const patientId = localStorage.getItem("userID");
        const journalId = e.target.getAttribute('journalid');
        console.log(journalId);

        fetch('http://localhost:5000/saveJournal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "journalEntry": newEntry.value, patientId, journalId }),
        })
            .then(res => res.json())
            .then(data => {
                console.log("Successfully saved the journal");
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    function createJournal(e) {
        const newJournal = { journalID: null, journalEntry: '', timeDone: new Date().toISOString() };
        setJournals([...journals, newJournal]);
        displayJournal(e, 2);
    }

    //  ---- JOURNAL FUNCTIONS END HERE ----

    return (
        <div className='flex-col flex-centered'>
            <h1>Welcome to your Patient Dashboard!</h1>
            {/* Display patient-specific content */}

            <div className="cards-container">
                <DashboardCard title="JOURNALS">
                    {journals && journals.map((row, index) => {
                        return (
                            <div key={`journal-${index}`}>
                                <input type='button' value={'Journal'} onClick={(e) => displayJournal(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>Journal Entry #{index + 1}</h2>
                                        <h3>Date Created: {new Date(row.timeDone).toDateString()}</h3>
                                        <textarea defaultValue={row.journalEntry}></textarea>
                                        <div>
                                            <input type='button' value={'CANCEL'} onClick={(e) => hideJournal(e)}></input>
                                            <input type='button' journalid={row.journalID} value={'SAVE'} onClick={(e) => saveJournal(e)}></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <input type='button' value={'CREATE NEW JOURNAL'} onClick={(e) => createJournal(e)}></input>
                </DashboardCard>

                <DashboardCard title="FEEDBACK">

                </DashboardCard>

                <DashboardCard title="DAILY SURVEYS">

                </DashboardCard>

                <DashboardCard title="INVOICES">

                </DashboardCard>

                <DashboardCard title="THERAPIST SURVEYS">

                </DashboardCard>
            </div>
        </div>
    );
}

export default PatientDashboard;