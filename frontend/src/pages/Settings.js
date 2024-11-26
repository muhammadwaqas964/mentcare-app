import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import io from 'socket.io-client';
import { DashboardCard, DashboardCardTitleless } from '../components/DashboardCards.js';
import './styles/Settings.css'
import defaultProfilePic from '../pages/assets/images/default-profile-pic.jpg';


// const socket = io('http://localhost:5000');

function SettingsPage() {
    const [userName, setUserName] = useState();
    const [email, setEmail] = useState();
    const [pfp, setPfp] = useState();

    const [userNameUpd, setUserNameUpd] = useState();
    const [emailUpd, setEmailUpd] = useState();
    const [pfpUpd, setPfpUpd] = useState();

    const [insComp, setInsComp] = useState();
    const [insID, setInsID] = useState();
    const [insTier, setInsTier] = useState();

    const [insCompUpd, setInsCompUpd] = useState();
    const [insIDUpd, setInsIDUpd] = useState();
    const [insTierUpd, setInsTierUpd] = useState();

    const [patientPrivacy, setPatientPrivacy] = useState();
    const [accountActive, setAccountActive] = useState();
    const [words, setWords] = useState();
    const accDeetsPopupRef = useRef(null);
    const insInfoPopupRef = useRef(null);
    const patientRef = useRef(null);
    const navigate = useNavigate();


    useEffect(() => {
        const realUserID = localStorage.getItem("realUserID");
        const userID = localStorage.getItem("userID");
        const userType = localStorage.getItem("userType");
        if (userType === "Patient") {
            patientRef.current.className = "";
        }

        fetch('http://localhost:5000/settingsAccountData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ realUserID: realUserID, userID: userID, userType: userType }),
        })
            .then(res => res.json())
            .then(data => {
                console.log("data", data);
                setUserName(data.userName);
                setEmail(data.email);
                setPatientPrivacy(data.patientPrivacy);
                setInsComp(data.insComp);
                setInsID(data.insID);
                setInsTier(data.insTier);

                // setAccountActive(data.accountActive);  // TODO: add active status to table
            })
            .catch(err => console.error('Error fetching data:', err));

        let imageExists = false;
        fetch("http://localhost:5000/retriveProfilePic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // Ensure the request is sent as JSON
            },
            body: JSON.stringify({ realUserID }),
        })
            .then((res) => {
                if (res.ok) {
                    imageExists = true;
                }
                return res.blob();
            })
            .then((data) => {
                if (imageExists) {
                    const imageUrl = URL.createObjectURL(data);
                    // console.log("Image Blob:", data);
                    // console.log("Image URL:", imageUrl);
                    setPfp(imageUrl);
                    imageExists = false;
                }
                else {
                    setPfp(defaultProfilePic);
                }
            })
            .catch((error) => {
                console.error("Error fetching image:", error);
            });
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

    const editAccDetails = () => {
        accDeetsPopupRef.current.className = 'popUp-background';
    }

    const cancelEditAccDetails = () => {
        accDeetsPopupRef.current.className = 'hidden popUp-background';
    }

    const saveAccDetails = (event) => {
        event.preventDefault();

        const userId = localStorage.getItem("userID");
        const userType = localStorage.getItem("userType");

        fetch('http://localhost:5000/settingsUpdAccDetails', {
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
                accDeetsPopupRef.current.className = 'hidden popUp-background';
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    const editInsDetails = () => {
        insInfoPopupRef.current.className = 'popUp-background';
    }

    const cancelEditInsDetails = () => {
        insInfoPopupRef.current.className = 'hidden popUp-background';
    }

    const saveInsDetails = (event) => {
        event.preventDefault();

        const userId = localStorage.getItem("userID");

        fetch('http://localhost:5000/settingsUpdInsDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId, insCompUpd: insCompUpd === "" ? insComp : insCompUpd,
                insIDUpd: insIDUpd === "" ? insID : insIDUpd, insTierUpd: insTierUpd === "" ? insTier : insTierUpd
            }),
        })
            .then(res => res.json())
            .then(data => {
                setInsComp(data.insComp);
                setInsID(data.insID);
                setInsTier(data.insTier);
                insInfoPopupRef.current.className = 'hidden popUp-background';
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    const privacyHandler = (event) => {
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
                    <div>
                        <h1>Account Details</h1>
                        <p>Name: {userName}</p>
                        <p>Email: {email}</p>
                        {pfp ? (
                            <div className="centered">
                                <img src={pfp} alt="Profile" className="navbar-profile-pic" />
                            </div>
                        ) : (
                            <div className="centered">
                                <img src={defaultProfilePic} alt="Profile" className="navbar-profile-pic" />
                            </div>
                        )}
                        <button type="button" onClick={() => editAccDetails()}>Edit Details</button>
                    </div>
                    <div ref={patientRef} className="hidden" style={{ "width": "100%", "height": "100%" }}>
                        <br /><br />
                        <label htmlFor="theme">Allow therpists to see old records?</label><br />
                        <select name="theme" id="theme" defaultValue={patientPrivacy} onChange={(event) => privacyHandler(event)}>
                            <option value="False">No</option>
                            <option value="True">Yes</option>
                        </select>
                        <hr style={{ "width": "100%", "height": "4px", "border": "none", "marginTop": "25px", "marginBottom": "-10px", "backgroundColor": "black" }} />
                        <h1>Insurance Information</h1>
                        <p>Insurance Company: {insComp}</p>
                        <p>Insurance ID: {insID}</p>
                        <p>Insurance Tier: {insTier}</p>
                        <button type="button" onClick={() => editInsDetails()}>Edit Details</button>
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

            <div ref={accDeetsPopupRef} className="hidden popUp-background">
                <div className="settings-popUp flex-row flex-centered">
                    <form onSubmit={(event) => saveAccDetails(event)}>
                        <input type="text" id="nameBox" name="nameBox" placeholder="Name" defaultValue={userName} onChange={(event) => event.target.value !== '' ? setUserNameUpd(event.target.value) : setUserNameUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <input type="text" id="emailBox" name="emailBox" placeholder="Email" defaultValue={email} onChange={(event) => event.target.value !== '' ? setEmailUpd(event.target.value) : setEmailUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <input type="text" id="pfpBox" name="pfpBox" placeholder="PFP URL" defaultValue={pfp} onChange={(event) => event.target.value !== '' ? setPfpUpd(event.target.value) : setPfpUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <div className="flex-centered">
                            &nbsp;&nbsp;<input type="submit" value="Save Details" />&nbsp;&nbsp;
                            <button type="button" onClick={() => cancelEditAccDetails()}>Cancel Details</button>
                        </div>
                    </form>
                </div>
            </div>

            <div ref={insInfoPopupRef} className="hidden popUp-background">
                <div className="settings-popUp flex-row flex-centered">
                    <form onSubmit={(event) => saveInsDetails(event)}>
                        <input type="text" id="insCompBox" name="insCompBox" placeholder="Insurance Company" defaultValue={insComp} onChange={(event) => event.target.value !== '' ? setInsCompUpd(event.target.value) : setInsCompUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <input type="text" id="insIDBox" name="insIDBox" placeholder="Insurance ID" defaultValue={insID} onChange={(event) => event.target.value !== '' ? setInsIDUpd(event.target.value) : setInsIDUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <input type="text" id="insTierBox" name="insTierBox" placeholder="Insurance Tier" defaultValue={insTier} onChange={(event) => event.target.value !== '' ? setInsTierUpd(event.target.value) : setInsTierUpd('')} style={{ "width": "100%", "marginBottom": "5px" }} /><br />
                        <div className="flex-centered">
                            &nbsp;&nbsp;<input type="submit" value="Save Details" />&nbsp;&nbsp;
                            <button type="button" onClick={() => cancelEditInsDetails()}>Cancel Details</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SettingsPage;