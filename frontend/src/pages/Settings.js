import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
import { DashboardCard, DashboardCardTitleless } from '../components/DashboardCards.js';
// import './styles/TherapistDashboard.css'

// const socket = io('http://localhost:5000');

function SettingsPage() {
    const [userName, setUserName] = useState();
    const [email, setEmail] = useState();
    const [pfp, setPfp] = useState();
    const [patientPrivacy, setPatientPrivacy] = useState();
    const [accountActive, setAccountActive] = useState();

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        const userType = localStorage.getItem("userType");
        console.log(userId);
        console.log(userType);

        fetch('http://localhost:5000/settingsAccountData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, userType: userType }),
        })
            .then(res => res.json())
            .then(data => {
                setUserName(data.userName);
                setEmail(data.email);
                setPfp(data.pfp);
                console.log(data);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    return (
        <>
            <div className="flex-col flex-centered main-container">
                <p>Account Details</p>
                <p>Name: {userName}</p>
                <p>Email: {email}</p>
                <p>PFP: {pfp}</p>
                <p>Make this the edit button</p>
                <p>Appearance</p>
                <p>Theme: DROPDOWN HERE</p>
                <p>Privacy</p>
                <p>Allow therapists to see your records? BUTTON HERE</p>
                <p>DELETE/DEACTIVATE ACCOUNT BUTTON HERE</p>
            </div>
        </>
    );
}

export default SettingsPage;