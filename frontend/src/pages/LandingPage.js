import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../presets.css';
import './styles/LandingPage.css';

import missionImage1 from './assets/images/img4_mission.png';
import missionImage2 from './assets/images/img5_mission.png';
import missionImage3 from './assets/images/img6_mission.png';

function LandingPage() {
    const navigate = useNavigate();
    const [testimonials, setTestimonials] = useState([]);
    const [mission, setMission] = useState("");
    const [faqs, setFaqs] = useState([]);

    // Fetch Testimonials
    useEffect(() => {
        fetch('http://127.0.0.1:5000/testimonials')
            .then(response => response.json())
            .then(data => {
                if (data.Testimonials) {
                    setTestimonials(data.Testimonials);
                }
            })
            .catch(error => console.error('Error fetching testimonials:', error));
    }, []);

    // Fetch Company Data (Mission and FAQs)
    useEffect(() => {
        fetch('http://127.0.0.1:5000/companydata')
            .then(response => response.json())
            .then(data => {
                if (data.Mission) {
                    setMission(data.Mission);
                }
                if (data.FAQs) {
                    setFaqs(data.FAQs);
                }
            })
            .catch(error => console.error('Error fetching company data:', error));
    }, []);

    return (
        <div className="landing-page">
            <section className="statement">
                <div className="statement">
                    <h1>Mission Statement</h1>
                    <p>{mission}</p>
                    <img src={missionImage2} alt="MentCare Mission" className="about-image" />
                    <img src={missionImage1} alt="MentCare Mission" className="about-image" />
                    <img src={missionImage3} alt="MentCare Mission" className="about-image" />
                </div>
            </section>

            <section className="testimonials">
                <h1>Testimonials</h1>
                {testimonials.length > 0 ? (
                    testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial">
                            <p>"{testimonial.Content}" — {testimonial.Username}</p>
                        </div>
                    ))
                ) : (
                    <p>No testimonials available.</p>
                )}
            </section>

            <section className="faqs">
                <h1>FAQs</h1>
                {faqs.length > 0 ? (
                    faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <strong>Q:</strong> {faq.Question}<br />
                            <strong>A:</strong> {faq.Answer}
                        </div>
                    ))
                ) : (
                    <p>No FAQs available.</p>
                )}
            </section>

            <section className="contact-us">
                <h1>Contact Us</h1>
                <div>Need Assistance? Call: 123-1234-1234 or Email: mentcareabc@gmail.com</div>
            </section>
        </div>
    );
}

export default LandingPage;
