import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import "../presets.css";
import NotificationBellImg from "./notification-bell.png";
import NotificationBellActiveImg from "./notification-bell-active.png";

const Navbar = () => {
  const [userData, setUserData] = useState();
  const [notifications, setNotifications] = useState(null);
  const [bellImage, setBellImage] = useState(NotificationBellImg);

  //  Routing makes window.location not update on tab clicks
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(location.pathname);

  const bellRef = useRef(null);

  const isLoggedIn = localStorage.getItem("userID") ? true : false;

  function handleTabClick(path) {
    if (path === "/logout") {
      localStorage.removeItem("userID");
      localStorage.removeItem("userType");
      setUserData();
      setSelectedTab("/dashboard");
      return;
    }
    setSelectedTab(path.toLowerCase());
  }

  useEffect(() => {
    const userId = localStorage.getItem("userID");
    const userType = localStorage.getItem("userType");

    fetch("http://localhost:5000/navbarData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userType }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data[0][0]);
        setNotifications(data[1]);
        handleTabClick(location.pathname);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [localStorage.getItem("userID")]);

  useEffect(() => {
    if (!notifications) {
      setBellImage(NotificationBellImg);
    } else {
      setBellImage(NotificationBellActiveImg);
    }
  }, [notifications]);

  function toggleNotifications() {
    if (bellRef.current.className === "notifs-dropdown-items hidden") {
      bellRef.current.className = "notifs-dropdown-items";
    } else {
      bellRef.current.className = "notifs-dropdown-items hidden";
    }
  }

  function handleNotificationClick(redLocation, notificationID) {
    if (redLocation !== "null") {
      handleTabClick(redLocation);
      navigate(redLocation);
      handleRemoveNotification(notificationID);
    }
  }

  function handleRemoveNotification(notificationID) {
    const updatedNotifications = [...notifications].filter(
      (notification) => notification.notificationID !== parseInt(notificationID)
    );
    if (updatedNotifications.length === 0) {
      setNotifications(null);
    } else {
      setNotifications(updatedNotifications);
    }

    fetch("http://localhost:5000/deleteNotification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationID }),
    }).catch((err) => console.error("Error fetching data:", err));
  }

  return (
    <nav>
      <div className="left-section">
        <Link to="/" onClick={() => handleTabClick(`/`)}>
          <h2 className="navbar-tab">MentCare</h2>
        </Link>
      </div>

      <div className="mid-section">
        {userData && (
          <div className="flex-row" style={{ gap: "20px" }}>
            <Link
              to={`/dashboard`}
              onClick={() => handleTabClick(`/dashboard`)}
            >
              <h2
                className={`navbar-tab ${
                  selectedTab === "/dashboard" ? "active-tab" : "selectable-tab"
                }`}
              >
                Dashboard
              </h2>
            </Link>

            {userData.userType === "Patient" && (
              <Link
                to={`/therapistlist`}
                onClick={() => handleTabClick(`/therapistlist`)}
              >
                <h2
                  className={`navbar-tab ${
                    selectedTab === "/therapistlist"
                      ? "active-tab"
                      : "selectable-tab"
                  }`}
                >
                  Therapist List
                </h2>
              </Link>
            )}

            {userData.userType === "Therapist" && (
              <Link to={`/profile`} onClick={() => handleTabClick(`/profile`)}>
                <h2
                  className={`navbar-tab ${
                    selectedTab === "/profile"
                      ? "active-tab"
                      : "selectable-tab"
                  }`}
                >
                  Profile
                </h2>
              </Link>
            )}

            <Link to={`/chat`} onClick={() => handleTabClick(`/chat`)}>
              <h2
                className={`navbar-tab ${
                  selectedTab === "/chat" ? "active-tab" : "selectable-tab"
                }`}
              >
                Chats
              </h2>
            </Link>
          </div>
        )}
      </div>

      <div className="right-section">
        {!isLoggedIn ? (
          <Link to={`/login`} onClick={() => handleTabClick(`/login`)}>
            <h2>Login</h2>
          </Link>
        ) : (
          <>
            {userData ? (
              <div className="flex-row user-bell-container">
                <div className="dropdown">
                  <h2 className="username">{userData.userName}</h2>

                  {userData.userType === "Patient" ? (
                    <div className="dropdown-items">
                      <Link
                        to={`/settings`}
                        onClick={() => handleTabClick(`/settings`)}
                        className="hamburger-item"
                      >
                        Settings
                      </Link>
                      <Link
                        to={`/login`}
                        onClick={() => handleTabClick(`/logout`)}
                        className="hamburger-item"
                      >
                        Log Out
                      </Link>
                    </div>
                  ) : (
                    <div className="dropdown-items">
                      <Link
                        to={`/therapistProfile`}
                        onClick={() =>
                          handleTabClick(`/therapistProfile`)
                        }
                        className="hamburger-item"
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/settings`}
                        onClick={() => handleTabClick(`/settings`)}
                        className="hamburger-item"
                      >
                        Settings
                      </Link>
                      <Link
                        to={`/login`}
                        onClick={() => handleTabClick(`/logout`)}
                        className="hamburger-item"
                      >
                        Log Out
                      </Link>
                    </div>
                  )}
                </div>

                <div className="notifs-dropdown">
                  <div
                    className="flex-col flex-centered"
                    style={{ height: "100%" }}
                  >
                    <img
                      src={bellImage}
                      width={"40px"}
                      height={"40px"}
                      onClick={() => toggleNotifications()}
                    />
                  </div>

                  {notifications ? (
                    <div
                      className="notifs-dropdown-items hidden"
                      ref={bellRef}
                    >
                      {notifications.map((row, index) => (
                        <div
                          key={`notif-${index}`}
                          onClick={() =>
                            handleNotificationClick(
                              `${row.redirectLocation}`,
                              `${row.notificationID}`
                            )
                          }
                          className={`flex-row hamburger-item ${
                            row.redirectLocation
                              ? "hamburger-item-pointer"
                              : "hamburger-item-no-pointer"
                          }`}
                        >
                          {row.message}
                          <input
                            type="button"
                            value={"X"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNotification(
                                `${row.notificationID}`
                              );
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="notifs-dropdown-items">
                      <div className="hamburger-item hamburger-item-no-pointer">
                        No Notifications!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


