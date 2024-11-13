import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import '../presets.css';

const Navbar = () => {
    const [userData, setUserData] = useState();

    //  Need this since Routing makes window.location not update on tab clicks
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState(location.pathname);
    const handleTabClick = (path) => {
        setSelectedTab(path.toLowerCase());
    };

    const isLandingPage = location.pathname === "/";
    const isLoginPage = location.pathname === "/login";
    const isRegistrationPage = location.pathname === "/register";
    const isLoggedIn = localStorage.getItem("userID") ? true : false;
    //const isRegisteredUser = localStorage.getItem('token') ? localStorage.getItem('token') : null;

    useEffect(() => {
        const userId = localStorage.getItem("userID");
        const userType = localStorage.getItem("userType");

        fetch('http://localhost:5000/navbarData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, userType }),
        })
            .then(res => res.json())
            .then(data => {
                console.log(data[0]);
                setUserData(data[0]);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    return (
        <nav>
            <div className="left-section">
                <Link to='/'>
                    <h2 className="navbar-tab">MentCare</h2>
                </Link>
            </div>

            <div className="mid-section">
                {/*
                {props.mid_tabs && props.mid_tabs.map(tabName => (
                    <Link to={`/${tabName}`} onClick={() => handleTabClick(`/${tabName}`)} key={`tab-${tabName}`}>
                        <h2 className={selectedTab === `/${tabName}` ? "selected" : console.log(`/${tabName}`)}>{tabName}</h2>
                    </Link>
                ))}
                */}
                {userData && (
                    <div className="flex-row" style={{ gap: '20px' }}>
                        {/* Common links for both Patient and Therapist */}
                        <Link to={`/dashboard`} onClick={() => handleTabClick(`/dashboard`)}>
                            <h2 className="navbar-tab">Dashboard</h2>
                        </Link>

                        {/* Conditional links based on userType */}
                        {userData.userType === 'Patient' && (
                            <Link to={`/therapistlist`} onClick={() => handleTabClick(`/therapistlist`)}>
                                <h2 className="navbar-tab">Therapist List</h2>
                            </Link>
                        )}
                        {userData.userType === 'Therapist' && (
                            <Link to={`/profile`} onClick={() => handleTabClick(`/profile`)}>
                                <h2 className="navbar-tab">Profile</h2>
                            </Link>
                        )}

                        <Link to={`/chats`} onClick={() => handleTabClick(`/chats`)}>
                            <h2 className="navbar-tab">Chats</h2>
                        </Link>
                    </div>
                )}
            </div>

            <div className="right-section">
                {isLoggedIn !== true ? (
                    <Link to={`/login`} onClick={() => handleTabClick(`/login`)}>
                        <h2>Login</h2>
                    </Link>
                ) : (
                    <h2>
                        {userData ? (
                            userData.userName
                        ) : (
                            <span>Patient</span>
                        )}
                    </h2>
                )}

                {/*
                <Link to={`/${props.right_tab}`} onClick={() => handleTabClick(`/${props.right_tab}`)}>
                    <h2 className={selectedTab === `/${props.right_tab}` ? "selected" : console.log(`/${props.right_tab}`)}>{props.right_tab}</h2>
                </Link>
                */}
            </div>
        </nav>
    );
}

export default Navbar;