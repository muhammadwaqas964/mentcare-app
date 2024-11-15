import React from 'react';
import './styles/LandingPage.css';
import backgroundImage from './assets/images/img1_bg.png';
import profileImage1 from './assets/images/img2_alex.png';
import profileImage2 from './assets/images/img3_mary.png';
import missionImage from './assets/images/img4_mission.png';

function LandingPage() {
    return (
        <div className="landing-page">
            <section className="about-us">
                <img src={backgroundImage} alt="bg pic1" className="about-image" />
                <button className="register-btn">Register Now</button>
            </section>

            <section className="about-us">
                <h2>Mission Statement</h2>
                <p>MentCare is a mental-health care organization dedicated to helping people access some of the best therapists around the world. These therapists will conduct mental diagnostic tests, and provide personalized health-care tools, resources, and treatment to the patients.
                </p>
                <img src={missionImage} alt="MentCare Mission" className="about-image" />
            </section>

            <section className="testimonials">
                <h2>Testimonials</h2>
                <div className="testimonial">
                    <img src={profileImage1} alt="profile pic1" className="profile-picture" />
                    <p>"MentCare has been a game-changer in my life. I was matched with a therapist who truly understands my challenges, and the resources provided have helped me manage my mental health in ways I never thought possible. The convenience of virtual sessions and personalized tools make it easy for me to stay on track."
                        — Alex R.</p>
                </div>
                <div className="testimonial">
                    <img src={profileImage2} alt="profile pic2" className="profile-picture" />
                    <p>"After struggling to find the right therapist locally, MentCare connected me with an amazing professional who provided a personalized treatment plan that addresses my specific needs. I feel understood and supported, and I can already see a positive change in my mental health."
                        — Mary T.</p>
                </div>
            </section>

            <section className="faqs">
                <h2>FAQs</h2>
                <div className="faq-item">Q: What is MentCare, and how does it work?<br /> Ans: MentCare is a mental health care organization that connects patients with top therapists worldwide. Our therapists provide mental diagnostic tests, personalized health tools, and treatment plans to help patients on their mental health journey. Through our app, you can find and connect with therapists, track progress, and access resources from anywhere.</div>
                <div className="faq-item">Q: How can I find a therapist that’s right for me?<br /> Ans: MentCare uses a detailed matching process to connect you with a therapist suited to your unique needs. During registration, you'll fill out a questionnaire about your preferences and challenges. Based on your responses, we suggest therapists who specialize in areas relevant to you.</div>
                <div className="faq-item">Q: Is my information secure with MentCare?<br /> Ans: Yes, MentCare is committed to maintaining the privacy and confidentiality of all users. We use advanced security protocols to protect your personal information and comply with industry standards for data security and privacy.</div>
            </section>

            <section className="contact-us">
                <h2>Contact Us</h2>
                <textarea placeholder="Leave a review"></textarea>
                <button className="send-btn">Send</button>
                <div>Need Assistance? Call: 123 1234 1234 or Email: mentcareabc@gmail.com</div>
            </section>
        </div>
    );
}

export default LandingPage;
