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
    const isRegisteredUser = localStorage.getItem('token') ? localStorage.getItem('token') : null;

    useEffect(() => {
        return () => {

        };
    }, []);

    return (
        <nav>
            <div className="left-section">
                <Link to='/'>
                    <h2>MentCare</h2>
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
            </div>

            <div className="right-section">
                {isLandingPage || isLoginPage || isRegistrationPage ? (
                    <Link to={`/login`} onClick={() => handleTabClick(`/login`)}>
                        <h2>Login</h2>
                    </Link>
                ) : (
                    <h2>Patient Name</h2>
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