import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../presets.css';
import './styles/LandingPage.css';

import missionImage1 from './assets/images/img4_mission.png';
import missionImage2 from './assets/images/img5_mission.png';
import missionImage3 from './assets/images/img6_mission.png';
import slide1 from './assets/images/slide1.jpg';
import slide2 from './assets/images/slide2.jpg';
import slide3 from './assets/images/slide3.jpg';

function LandingPage() {
    const [testimonials, setTestimonials] = useState([]);
    const [mission, setMission] = useState("");
    const [faqs, setFaqs] = useState([]);
    const [contact, setContact] = useState({ phone: "", email: "" });

    const navigate = useNavigate();

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

    // Fetch Company Data (Mission, FAQs, and Contact Us)
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
                if (data.Contact) {
                    // Ensure proper casing matches backend response
                    setContact({
                        phone: data.Contact.Phone || "",
                        email: data.Contact.Email || ""
                    });
                }
            })
            .catch(error => console.error('Error fetching company data:', error));
    }, []);

    function goToRegisterPage() {
        navigate('/register');
    }

    return (
        <div className="landing-page">


            <div class="CSSgal">

                <s id="s1"></s>
                <s id="s2"></s>
                <s id="s3"></s>

                <div className="slider">
                    <div className='slide-image' style={{ backgroundImage: `url(${slide1})` }}>
                        {/* <h2>PURE <b>CSS</b> SLIDESHOW</h2>
                        <p>Responsive Slideshow Gallery created using CSS only</p> */}
                    </div>
                    <div className='slide-image' style={{ backgroundImage: `url(${slide2})` }}>
                        {/* <h2>Slide 2</h2> */}
                    </div>
                    <div className='slide-image' style={{ backgroundImage: `url(${slide3})` }}>
                        {/* <h2>Slide 3</h2> */}
                    </div>
                </div>

                <div className="prevNext">
                    <div>
                        <a href="#s3">Back</a><a href="#s2">Next</a>
                    </div>
                    <div>
                        <a href="#s1">Back</a><a href="#s3">Next</a>
                    </div>
                    <div>
                        <a href="#s2">Back</a><a href="#s1">Next</a>
                    </div>
                </div>

                <div className="bullets">
                    <a href="#s1">1</a>
                    <a href="#s2">2</a>
                    <a href="#s3">3</a>
                </div>
            </div>


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

            <input className='lp-register-btn' onClick={() => goToRegisterPage()} value={"REGISTER NOW"}></input>

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
                <div>
                    Need Assistance? Call: {contact.phone || "N/A"} or Email: {contact.email || "N/A"}
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
