import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import '../presets.css';

const Navbar = () => {
    const [userData, setUserData] = useState();

    //  Need this since Routing makes window.location not update on tab clicks
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState(location.pathname);

    const isLoggedIn = localStorage.getItem("userID") ? true : false;

    function handleTabClick(path) {
        if (path === '/logout') {
            console.log("HELLO");
            localStorage.removeItem("userID");
            localStorage.removeItem("userType");
            setUserData();
            setSelectedTab('/dashboard');
            return;
        }
        setSelectedTab(path.toLowerCase());
        console.log(path);
    };

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
    }, [localStorage.getItem("userID"),]);   //  If it aint broke, dont fix it

    return (
        <nav>
            <div className="left-section">
                <Link to='/' onClick={() => handleTabClick(`/`)}>
                    <h2 className="navbar-tab">MentCare</h2>
                </Link>
            </div>

            <div className="mid-section">
                {userData && (
                    <div className="flex-row" style={{ gap: '20px' }}>
                        {/* Common links for both Patient and Therapist */}
                        <Link to={`/dashboard`} onClick={() => handleTabClick(`/dashboard`)}>
                            <h2 className={`navbar-tab ${selectedTab === '/dashboard' ? 'active-tab' : 'selectable-tab'}`}>Dashboard</h2>
                        </Link>

                        {/* Conditional links based on userType */}
                        {userData.userType === 'Patient' && (
                            <Link to={`/therapistlist`} onClick={() => handleTabClick(`/therapistlist`)}>
                                <h2 className={`navbar-tab ${selectedTab === '/therapistlist' ? 'active-tab' : 'selectable-tab'}`}>Therapist List</h2>
                            </Link>
                        )}
                        {userData.userType === 'Therapist' && (
                            <Link to={`/profile`} onClick={() => handleTabClick(`/profile`)}>
                                <h2 className={`navbar-tab ${selectedTab === '/profile' ? 'active-tab' : 'selectable-tab'}`}>Profile</h2>
                            </Link>
                        )}

                        <Link to={`/chat`} onClick={() => handleTabClick(`/chat`)}>
                            <h2 className={`navbar-tab ${selectedTab === '/chat' ? 'active-tab' : 'selectable-tab'}`}>Chats</h2>
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
                    <>
                        {userData ? (  // Check if userData exists before accessing it
                            <>
                                <div className="dropdown">
                                    <h2 className="username">{userData.userName}</h2>

                                    {userData.userType === 'Patient' ? (
                                        <div className="dropdown-items">
                                            <Link to={`/settings`} onClick={() => handleTabClick(`/settings`)} className="hamburger-item">
                                                Settings
                                            </Link>
                                            <Link to={`/login`} onClick={() => handleTabClick(`/logout`)} className="hamburger-item">
                                                Log Out
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="dropdown-items">
                                            <Link to={`/therapistProfile`} onClick={() => handleTabClick(`/therapistProfile`)} className="hamburger-item">
                                                Profile
                                            </Link>
                                            <Link to={`/settings`} onClick={() => handleTabClick(`/settings`)} className="hamburger-item">
                                                Settings
                                            </Link>
                                            <Link to={`/login`} onClick={() => handleTabClick('/logout')} className="hamburger-item">
                                                Log Out
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p>Loading...</p>  // Optional: Show a loading message while userData is being fetched
                        )}
                    </>
                )}

                {/*
                <Link to={`/${props.right_tab}`} onClick={() => handleTabClick(`/${props.right_tab}`)}>
                    <h2 className={selectedTab === `/${props.right_tab}` ? "selected" : console.log(`/${props.right_tab}`)}>{props.right_tab}</h2>
                </Link>
                */}
            </div>
        </nav >
    );
}

export default Navbar;