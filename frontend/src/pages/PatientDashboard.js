import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function PatientDashboard() {
    const [journals, setJournals] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [surveys, setSurveys] = useState([]);

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
        <div>
            <h1>Welcome to your Patient Dashboard</h1>
            {/* Display patient-specific content */}

            <div className="card-container">
                {journals.map(row => (
                    <tr key={row.film_id}>
                        <>
                            <td className='cell-info-actor'>{row.title}</td>
                            <td className='cell-info-actor'>{row.rental_count}</td>
                        </>
                    </tr>
                ))}
            </div>
        </div>
    );
}

export default PatientDashboard;