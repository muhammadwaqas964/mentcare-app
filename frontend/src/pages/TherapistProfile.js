import React, { useEffect, useState } from 'react';
import './styles/TherapistProfile.css';
import { useParams } from 'react-router-dom';
import '../presets.css';

function TherapistProfile() {
    const { therapistName } = useParams();
    const [therapists, setTherapists] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/therapists')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setTherapists(data.Therapists);
            })
            .catch(error => {
                console.error('Error fetching therapists:', error);
            });
    }, []);

    // Function to capitalize the first letter
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div className="therapist-profile">
            <h1>Therapist Profiles</h1>
            {therapists.length > 0 ? (
                therapists.map((therapist, index) => (
                    <section key={index} className="profile">
                        <h1>About {capitalize(therapist.Username)}</h1>
                        <p><strong>Passion Statement:</strong> {therapist.Intro}</p>
                        <p><strong>License Number:</strong> {therapist.LicenseNumber}</p>
                        <p><strong>Education:</strong> {therapist.Education}</p>
                        <p><strong>Specializations:</strong> {therapist.Specializations}</p>
                        <p><strong>Days and Hours:</strong> {therapist.DaysHours}</p>
                        <p><strong>Pricing:</strong> {therapist.Price}</p>
                        <p><strong>Patient's Testimonial for Therapist:</strong> {therapist.Patient_Testimonial || "No testimonial available."}</p>
                    </section>
                ))
            ) : (
                <p>No therapists available.</p>
            )}
        </div>
    );
}

export default TherapistProfile;
