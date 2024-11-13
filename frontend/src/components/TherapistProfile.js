import React from 'react';
import './TherapistProfile.css';
import profilePicture from './assets/images/img1_th_mike.png';

function TherapistProfile() {
    return (
        <div className="therapist-profile">
            <header className="header">
                <h1>MentCare</h1>
                <button className="login-btn">Login</button>
            </header>

            <section className="profile">
                <img src={profilePicture} alt="Mike K." className="profile-picture" />
                <h2>About Me</h2>
                <p>
                    Hello, I'm Mike K., a licensed psychotherapist with over 15 years of experience in mental health care. I specialize in cognitive-behavioral therapy (CBT) and mindfulness-based approaches to help individuals navigate challenges such as anxiety, depression, and stress. My goal is to create a supportive and non-judgmental environment where clients feel empowered to explore their thoughts and emotions. Together, we can work towards achieving your personal goals and enhancing your overall well-being.
                </p>
                <p><strong>Therapist Name:</strong> Mike K.</p>
            </section>

            <section className="availability">
                <h3>Availability</h3>
                <p>Monday - Friday: 8am - 12:30pm & 3pm - 8pm</p>
            </section>

            <section className="pricing">
                <h3>Pricing</h3>
                <p>$15 per hour</p>
                <button className="reach-out-btn">Reach Out</button>
            </section>

            <section className="reviews">
                <h3>Reviews</h3>
                <div className="rating-bar">5★</div>
                <div className="rating-bar">4★</div>
                <div className="rating-bar">3★</div>
                <div className="rating-bar">2★</div>
                <div className="rating-bar">1★</div>
            </section>

            <section className="patient-reviews">
                <h3>Patient Reviews</h3>
                <div className="review-item">
                    <p><strong>Sarah L.:</strong> 5★ "Working with Mike has been transformative. His empathetic approach and practical strategies have helped me manage my anxiety more effectively. I feel more in control of my life now."</p>
                </div>
                <div className="review-item">
                    <p><strong>John D.:</strong> 5★ "Mike's expertise in CBT has been invaluable. He guided me through challenging times with patience and understanding, and I am grateful for the positive changes in my mental health."</p>
                </div>
                <div className="review-item">
                    <p><strong>Emily R.:</strong> 5★ "I was hesitant about therapy, but Mike made me feel comfortable from the start. His mindfulness techniques have significantly improved my stress levels. Highly recommend!"</p>
                </div>
                <div className="review-item">
                    <p><strong>David M.:</strong> 5★ "Mike is a compassionate and skilled therapist. He listens without judgment and offers insightful feedback that has helped me gain a better understanding of myself."</p>
                </div>
                <div className="review-item">
                    <p><strong>Lisa T.:</strong> 5★ "Therapy with Mike has been a game-changer. His personalized approach and dedication to my progress have made a significant impact on my journey towards better mental health."</p>
                </div>
                <button className="add-review-btn">Add Review</button>
            </section>
        </div>
    );
}

export default TherapistProfile;
