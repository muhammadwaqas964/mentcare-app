import React, { useState, useEffect, useRef } from "react";
import "./styles/Chat.css";

function Chat({ userType, chooseId }) {
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState("");
    const chatBoxRef = useRef(null);

    useEffect(() => {
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
    }, [chooseId, userType]);

    const handleTherapistSelect = (therapist) => {
        setSelectedTherapist(therapist);
        setChatHistory(JSON.parse(therapist.content).chats);
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
                patientId = selectedTherapist.patientID;
            } else {
                patientId = chooseId;
            }

            if (userType === "Patient") {
                therapistId = selectedTherapist.therapistID;
            } else {
                therapistId = chooseId;
            }

            await fetch("http://localhost:5000/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: patientId,
                    therapistId: therapistId,
                    message: input,
                    sender: sender,
                }),
            });
        }
    };


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
                        {therapists.map((therapist) => (
                            <button key={therapist.therapistID || therapist.patientID}
                                className={`chat-item ${selectedTherapist?.therapistID === therapist.therapistID ? "current" : ""}`}
                                onClick={() => handleTherapistSelect(therapist)}>
                                {therapist.therapistName || therapist.patientName}
                            </button>
                        ))}
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
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="send-button"
                                onClick={handleSendMessage}
                            >
                                Send
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;
