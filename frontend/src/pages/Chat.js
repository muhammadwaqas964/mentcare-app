import React, { useState, useEffect, useRef } from "react";
import "./styles/Chat.css";
import BasicModalInvoice from "../components/InvoiceModal";
import { io } from 'socket.io-client';

function Chat() {
    const userType = localStorage.getItem('userType');
    const chooseId = localStorage.getItem('userID');

    const [therapists, setTherapists] = useState([]);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState("");
    const chatBoxRef = useRef(null);
    const socket = useRef();

    useEffect(() => {
        socket.current = io('http://localhost:5000')

        const fetchChats = async () => {
            const response = await fetch("http://localhost:5000/userChats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chooseId, userType }),
            });
            const data = await response.json();
            console.log(data);
            setTherapists(data);
        };

        fetchChats();

        socket.current.on('chat-start', (data) => {
            console.log("Patient notified:", data.room);
            socket.current.emit('join', { room: data.room });

            setSelectedTherapist({
                therapistID: data.room[0],
                patientID: data.room[2],
                chatStatus: 'Active',
            });
        });

        socket.current.on('chat-end', (data) => {
            console.log("Chat ended in room:", data.room);
            setSelectedTherapist((prev) =>
                prev ? { ...prev, chatStatus: 'Inactive' } : null
            );
        });

        return () => {
            socket.current.off('chat-start');
            socket.current.off('chat-end');
            socket.current.disconnect();
        };
    }, [chooseId, userType]);

    const handleTherapistSelect = (therapist) => {
        setSelectedTherapist({
            therapistID: therapist.therapistID || therapist.patientID,
            therapistName: therapist.therapistName || therapist.patientName,
            content: therapist.content,
            chatStatus: therapist.chatStatus,
            requestStatus: therapist.requestStatus,
        });
        setChatHistory(JSON.parse(therapist.content).chats);
    };

    const updateUsers = async () => {
        const response = await fetch("http://localhost:5000/userChats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chooseId, userType }),
        });
        const data = await response.json();
        return data;
    };


    const handleSendMessage = async () => {
        if (input.trim() !== "" && selectedTherapist) {
            let sender;
            if (userType === "Therapist") {
                sender = "T";
            } else {
                sender = "P";
            }

            const newMessage = {
                sender: sender,
                msg: input,
            };
            setChatHistory([...chatHistory, newMessage]);
            setInput("");
            let patientId;
            let therapistId;

            if (userType === "Therapist") {
                patientId = selectedTherapist.therapistID;
            } else {
                patientId = chooseId;
            }

            if (userType === "Patient") {
                therapistId = selectedTherapist.therapistID;
            } else {
                therapistId = chooseId;
            }

            const response = await fetch("http://localhost:5000/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: patientId,
                    therapistId: therapistId,
                    message: input,
                    sender: sender,
                }),
            });

            if (response.ok) {
                const updatedUsers = await updateUsers();
                setTherapists(updatedUsers);
                setSelectedTherapist((prevSelected) =>
                    prevSelected ? { ...prevSelected } : null
                );
            } else {
                console.error("Failed to update new message history");
            }
        }
    };

    const handleStatus = async (status, type) => {
        if (userType === "Therapist") {
            const patientId = selectedTherapist.therapistID;
            const response = await fetch("http://localhost:5000/updateStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId: chooseId,
                    patientId: patientId,
                    status: status,
                    type: type,
                }),
            });

            if (response.ok) {
                const updatedUsers = await updateUsers();
                setTherapists(updatedUsers);
                setSelectedTherapist((prevSelected) =>
                    prevSelected ? { ...prevSelected, chatStatus: status } : null
                );
            } else {
                console.error("Failed to update chatStatus");
            }
        }
        else if (userType === "Patient") {
            const therapistId = selectedTherapist.therapistID;
            const response = await fetch("http://localhost:5000/updateStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistId: therapistId,
                    patientId: chooseId,
                    status: status,
                    type: type,
                }),
            });

            if (response.ok) {
                const updatedUsers = await updateUsers();
                setTherapists(updatedUsers);
                setSelectedTherapist((prevSelected) =>
                    prevSelected ? { ...prevSelected, requestStatus: status } : null
                );
            } else {
                console.error("Failed to update requestStatus");
            }
        }
    };

    const handleStartChat = () => {
        if (selectedTherapist) {
            socket.current.emit('chat-start', {
                therapistId: chooseId,
                patientId: selectedTherapist?.therapistID,
            });
            console.log("started chat");
            handleStatus('Active', 'chat')
        }
    }

    const handleEndChat = () => {
        if (selectedTherapist) {
            socket.current.emit('chat-end', {
                therapistId: chooseId,
                patientId: selectedTherapist?.therapistID,
            });
            console.log("Ended  cat");
            handleStatus('Inactive', 'chat')
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className="chat-page">
            <div className="main-container">
                <div className="sidebar">
                    <div className="chat-list">
                        {therapists.map((therapist) => {
                            const isCurrent = selectedTherapist?.therapistID === (therapist.therapistID || therapist.patientID);
                            return (
                                <button key={therapist.therapistID || therapist.patientID}
                                    className={therapist.chatStatus === 'Active' ? `chat-item ${isCurrent ? "current" : ""}` : `chat-item ${isCurrent ? "inactivechosen" : "inactive"}`}
                                    onClick={() => handleTherapistSelect(therapist)}>
                                    {therapist.therapistName || therapist.patientName}
                                </button>
                            );
                        })}
                    </div>
                    <div className="bottom-list">
                        {(userType === 'Therapist' && selectedTherapist?.chatStatus === 'Inactive' && selectedTherapist?.requestStatus === 'Active') ?
                            <div className="request-chat-button not" style={{ textAlign: "center" }}>Patient has requested to chat!</div> : ''}
                        {(userType === 'Therapist' && selectedTherapist?.chatStatus === 'Active') ? <button className="request-chat-button inactive">Start Chat</button> :
                            userType === 'Therapist' && selectedTherapist ? <button className="request-chat-button" onClick={() => handleStartChat('Active', 'chat')}>Start Chat</button> :
                                (userType === 'Patient' && selectedTherapist?.chatStatus === 'Inactive' && selectedTherapist?.requestStatus === 'Inactive') ?
                                    <button className="request-chat-button" onClick={() => handleStatus('Active', 'request')}>Request to chat</button> : (userType === 'Patient') ?
                                        <button className="request-chat-button inactive">Request to Chat</button> : <button className="request-chat-button inactive">Start Chat</button>}
                    </div>
                </div>
                <div className="chat-box-container">
                    <div className="chat-box-header">
                        {selectedTherapist ? selectedTherapist.therapistName || selectedTherapist.patientName : "Select a Chat"}
                    </div>
                    <div className="chat-box" ref={chatBoxRef}>
                        {chatHistory.map((message, index) => {
                            const isUserMessage =
                                (userType === "Patient" &&
                                    message.sender === "P") ||
                                (userType === "Therapist" &&
                                    message.sender === "T");
                            return (
                                <div
                                    key={index}
                                    className={`chat-bubble ${isUserMessage ? "user" : "therapist"}`}>
                                    {message.msg}
                                </div>
                            );
                        })}
                    </div>
                    {selectedTherapist && (
                        <div className="chat-input-container">
                            {selectedTherapist?.chatStatus === 'Active' ? <input
                                type="text"
                                className="chat-input"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            /> : <div className="chat-input inactive">This chat is inactive</div>}
                            {(selectedTherapist?.chatStatus === 'Active') ? <button className="send-button" onClick={handleSendMessage}>Send</button> :
                                <button className="send-button inactive">Send</button>}
                        </div>
                    )}
                </div>
                {(selectedTherapist?.chatStatus === 'Active' && userType === 'Therapist') ? <div className="invoice-container">
                    <button className="invoice-button" onClick={() => handleEndChat('Inactive', 'chat')}>End Chat</button>
                    {/* <button className="invoice-button" onClick={BasicModalInvoice}>Send Invoice</button> */}
                    <BasicModalInvoice patientId={selectedTherapist?.therapistID} therapistId={chooseId} />
                </div> : ((selectedTherapist?.chatStatus === 'Inactive' && userType === 'Therapist') ?
                    <div className="invoice-container">
                        <button className="invoice-button inactive">End Chat</button>
                        <button className="invoice-button inactive">Send Invoice</button></div> :
                    ((userType === 'Therapist') ? <div className="invoice-container"></div> : ''))}
            </div> {/* Container end (kill me)*/}
        </div>
    );
}

export default Chat;
