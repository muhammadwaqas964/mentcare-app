import React, { useState, useRef, useEffect } from 'react';
import './styles/Chat.css';

{/* Buttons non-functional, working on it
    Also the chat inactivity, still figuring it out*/}
function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const chatBoxRef = useRef(null);

    const handleSendMessage = () => {
        if (input.trim() !== '') {
            const newMessage = {
                text: input,
                sender: 'user',
            };

            setMessages([...messages, newMessage]);
            setInput('');

            {/* Tester message placeholder for the therapist */}
            setTimeout(() => {
                const replyMessage = {
                    text: 'Cyberbullying? Just close the computer haha.',
                    sender: 'therapist',
                };

                setMessages((prevMessages) => [...prevMessages, replyMessage]);
            }, 3000);
            {/* Tester message placeholder for the therapist */}
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-page">
            <div className="main-container">
                <div className="sidebar">
                    <div className="chat-list">
                        {/* PLACEHOLDERS */}
                        <div className="chat-item current">Dr. Guy</div>
                        <div className="chat-item">T1</div>
                        {/* PLACEHOLDERS */}
                    </div>
                    <button className="request-chat-button">REQUEST TO CHAT</button>
                </div>

                <div className="chat-box-container">
                    <div className="chat-box-header">Dr. Guy</div>
                    <div className="chat-box" ref={chatBoxRef}>
                        {messages.map((message, index) => (
                            <div key={index} className={`chat-bubble ${message.sender}`}>
                                {message.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-container">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="MESSAGE..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="send-button" onClick={handleSendMessage}>SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
