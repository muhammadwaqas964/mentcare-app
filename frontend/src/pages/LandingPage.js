import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../presets.css';
import './LandingPage.css';
import '../presets.css';

import profileImage1 from './assets/images/img2_alex.png';
import profileImage2 from './assets/images/img3_mary.png';
import missionImage1 from './assets/images/img4_mission.png';
import missionImage2 from './assets/images/img5_mission.png';
import missionImage3 from './assets/images/img6_mission.png';


function LandingPage() {
    const navigate = useNavigate();



    const handleTabClick = (path) => {
        navigate(path);
    };

    return (
        <div className="landing-page">
            <header className="header">
                <h1>MentCare</h1>
            </header>

            <nav className="tabs">
                <button className="nav-btn" onClick={() => handleTabClick('/register')}>Register</button>
                <button className="nav-btn" onClick={() => handleTabClick('/login')}>Login</button>
                <button className="nav-btn" onClick={() => handleTabClick('/therapist')}>Therapist</button>
                <button className="nav-btn" onClick={() => handleTabClick('/therapistProfile')}>Therapist Profile</button>
                <button className="nav-btn" onClick={() => handleTabClick('/patient')}>Patient</button>
                <button className="nav-btn" onClick={() => handleTabClick('/chat')}>Chat</button>
                <button className="nav-btn" onClick={() => handleTabClick('/payment')}>Payment</button>
            </nav>

            <section className="statement">
                
                <div className="statement">
                <h2>Mission Statement</h2>
                  <p>
                    MentCare is a mental-health care organization dedicated to helping people access some of the best therapists around the world. These therapists conduct mental diagnostic tests and provide personalized health-care tools, resources, and treatment to patients.
                    <br></br><br></br>The mental health care cycle encompasses several key stages to ensure comprehensive support for individuals: 
                    <br></br><br></br><strong>Access to Care:</strong>This initial phase involves recognizing the need for mental health services and overcoming barriers to obtain them. 
                    <br></br><br></br><strong>Assessment and Diagnosis:</strong> Mental health professionals conduct thorough evaluations to understand an individual's psychological state, leading to accurate diagnoses.  
                    <br></br><br></br><strong>Treatment Planning and Implementation:</strong>Based on the assessment, a personalized treatment plan is developed, includes mental therapy, and healthy lifestyle changes.
                    <br></br><br></br><strong>Monitoring and Evaluation: </strong> Continuous monitoring of the individual's progress allows for adjustments to the treatment plan as needed. 
                    <br></br><br></br>These stages collectively form a structured approach to mental health care, promoting effective treatment and recovery.
                  </p>
                 <img src={missionImage2} alt="MentCare Mission" className="about-image" />
                 <img src={missionImage1} alt="MentCare Mission" className="about-image" />
                 <img src={missionImage3} alt="MentCare Mission" className="about-image" />
                </div>
            </section>

            <section className="testimonials">
                <h2>Testimonials</h2>
                <div className="testimonial">
                    <img src={profileImage1} alt="Alex R." className="profile-picture" />
                    <p>
                        "MentCare has been a game-changer in my life. I was matched with a therapist who truly understands my challenges, and the resources provided have helped me manage my mental health in ways I never thought possible. The convenience of virtual sessions and personalized tools make it easy for me to stay on track."
                        — Alex R.
                    </p>
                </div>
                <div className="testimonial">
                    <img src={profileImage2} alt="Mary T." className="profile-picture" />
                    <p>
                        "After struggling to find the right therapist locally, MentCare connected me with an amazing professional who provided a personalized treatment plan that addresses my specific needs. I feel understood and supported, and I can already see a positive change in my mental health."
                        — Mary T.
                    </p>
                </div>
            </section>

            <section className="faqs">
                <h2>FAQs</h2>
                <div className="faq-item">
                    <strong>Q:</strong> What is MentCare, and how does it work?<br />
                    <strong>A:</strong> MentCare is a mental health care organization that connects patients with top therapists worldwide. Our therapists provide mental diagnostic tests, personalized health tools, and treatment plans to help patients on their mental health journey. Through our app, you can find and connect with therapists, track progress, and access resources from anywhere.
                </div>
                <div className="faq-item">
                    <strong>Q:</strong> How can I find a therapist that’s right for me?<br />
                    <strong>A:</strong> MentCare uses a detailed matching process to connect you with a therapist suited to your unique needs. During registration, you'll fill out a questionnaire about your preferences and challenges. Based on your responses, we suggest therapists who specialize in areas relevant to you.
                </div>
                <div className="faq-item">
                    <strong>Q:</strong> Is my information secure with MentCare?<br />
                    <strong>A:</strong> Yes, MentCare is committed to maintaining the privacy and confidentiality of all users. We use advanced security protocols to protect your personal information and comply with industry standards for data security and privacy.
                </div>
            </section>

            <section className="contact-us">
                <h2>Contact Us</h2>
                <div>Need Assistance? Call: 123-1234-1234 or Email: mentcareabc@gmail.com</div>
            </section>
        </div>
    );
}

export default LandingPage;
