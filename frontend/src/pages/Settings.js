import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import io from 'socket.io-client';
import { DashboardCard, DashboardCardTitleless } from '../components/DashboardCards.js';
import './styles/Settings.css'

// const socket = io('http://localhost:5000');

function SettingsPage() {
    const [userName, setUserName] = useState();
    const [email, setEmail] = useState();
    const [pfp, setPfp] = useState();
    const [userNameUpd, setUserNameUpd] = useState();
    const [emailUpd, setEmailUpd] = useState();
    const [pfpUpd, setPfpUpd] = useState();
    const [patientPrivacy, setPatientPrivacy] = useState();
    const [accountActive, setAccountActive] = useState();
    const [words, setWords] = useState();
    const popupRef = useRef(null);
    const privacyRef = useRef(null);
    const navigate = useNavigate();


    useEffect(() => {
        const userId = localStorage.getItem("userID");
        const userType = localStorage.getItem("userType");
        if (userType === "Patient") {
            privacyRef.current.className = "";
        }

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
                setPatientPrivacy(data.patientPrivacy);
                // setAccountActive(data.accountActive);  // TODO: add active status to table
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    useEffect(() => {
        const userType = localStorage.getItem("userType");

        if (userType === "Therapist") {
            setWords(accountActive ? "Deactivate" : "Activate");
        }
        else if (userType === "Patient") {
            setWords("Delete");
        } else {
            setWords("Admin");
        }
    }, [accountActive]);

    const editDetails = () => {
        popupRef.current.className = 'popUp-background';
    }

    const cancelEditDetails = () => {
        popupRef.current.className = 'hidden popUp-background';
    }

    const saveDetails = (event) => {
        event.preventDefault();

        const userId = localStorage.getItem("userID");
        const userType = localStorage.getItem("userType");

        fetch('http://localhost:5000/settingsUpdDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId, userType: userType, userNameUpd: userNameUpd === "" ? userName : userNameUpd,
                emailUpd: emailUpd === "" ? email : emailUpd, pfpUpd: pfpUpd === "" ? pfp : pfpUpd
            }),
        })
            .then(res => res.json())
            .then(data => {
                setUserName(data.userName);
                setEmail(data.email);
                setPfp("Not yet implemented");
                popupRef.current.className = 'hidden popUp-background';
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    const privacyHandler = (event) => {
        alert(event.target.value);
        setPatientPrivacy(event.target.value);
        const userId = localStorage.getItem("userID");

        fetch('http://localhost:5000/settingsUpdPrivacy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, patientPrivacy: event.target.value }),
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    const accountChangeHandler = () => {
        alert("accountChangeHandler");

        const userId = localStorage.getItem("userID");
        const userType = localStorage.getItem("userType");

        fetch('http://localhost:5000/settingsRemoveAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, userType: userType }),
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                localStorage.setItem("userID", 0);
                navigate('/')
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    return (
        <>
            <div className="flex-col flex-centered main-container">
                <br /><br />
                <DashboardCardTitleless>
                    <h1>Account Details</h1>
                    <p>Name: {userName}</p>
                    <p>Email: {email}</p>
                    <p>PFP: {pfp}</p>
                    <button type="button" onClick={() => editDetails()}>Edit Details</button>
                    <div ref={privacyRef} className="hidden">
                        <br /><br />
                        <label htmlFor="theme">Allow therpists to see old records?</label><br />
                        <select name="theme" id="theme" defaultValue={patientPrivacy} onChange={(event) => privacyHandler(event)}>
                            <option value="False">No</option>
                            <option value="True">Yes</option>
                        </select>
                    </div>
                    <hr style={{ "width": "100%", "height": "4px", "border": "none", "marginTop": "25px", "marginBottom": "-10px", "backgroundColor": "black" }} />
                    <h1>Appearance</h1>
                    <label htmlFor="theme">Choose a theme:</label><br />
                    <select name="theme" id="theme">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </DashboardCardTitleless>
                <br /><br />
                <button type="button" onClick={() => accountChangeHandler()}>{words} Account</button> {/* TODO: Make this a big red button */}
            </div>

            <div ref={popupRef} className="hidden popUp-background">
                <div className="settings-popUp flex-row flex-centered">
                    <form onSubmit={(event) => saveDetails(event)}>
                        <input type="text" id="nameBox" name="nameBox" placeholder="Name" defaultValue={userName} onChange={(event) => event.target.value !== '' ? setUserNameUpd(event.target.value) : setUserNameUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <input type="text" id="emailBox" name="emailBox" placeholder="Email" defaultValue={email} onChange={(event) => event.target.value !== '' ? setEmailUpd(event.target.value) : setEmailUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <input type="text" id="pfpBox" name="pfpBox" placeholder="PFP URL" defaultValue={pfp} onChange={(event) => event.target.value !== '' ? setPfpUpd(event.target.value) : setPfpUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <div className="flex-centered">
                            &nbsp;&nbsp;<input type="submit" value="Save Details" />&nbsp;&nbsp;
                            <button type="button" onClick={() => cancelEditDetails()}>Cancel Details</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SettingsPage;