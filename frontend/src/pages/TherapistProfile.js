import React, { useEffect, useState } from 'react';
import './styles/TherapistProfile.css';
import { useParams } from 'react-router-dom';
import '../presets.css';
import { Rating, Slider, Pagination } from '@mui/material';

function TherapistProfile() {
    // const { therapistName } = useParams();
    // const [therapists, setTherapists] = useState([]);
    const [aboutMe, setAboutMe] = useState("Loading about me");
    const [therapistName, setTherapistName] = useState("Loading Name");
    const [availability, setAvailability] = useState("Loading availability");
    const [pricing, setPricing] = useState("Loading pricing");
    const [reviewsData, setReviewsData] = useState({ "avgStars": 0, "individualReviews": [{ "fives": 5, "fours": 4, "threes": 3, "twos": 2, "ones": 1 }] });
    const [totalReviews, setTotalReviews] = useState(15);

    // useEffect(() => {
    //     fetch('http://127.0.0.1:5000/therapists')
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             setTherapists(data.Therapists);
    //         })
    //         .catch(error => {
    //             console.error('Error fetching therapists:', error);
    //         });
    // }, []);

    // // Function to capitalize the first letter
    // const capitalize = (str) => {
    //     return str.charAt(0).toUpperCase() + str.slice(1);
    // }

    {/* <div className="therapist-profile">
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
    </div> */}
    return (
        <>
            <div className="flex-col main-container flex-centered">
                <div className="flex-row">
                    <div className="flex-col flex-centered thera-prof-top-left">
                        <p>PFP here</p>
                        <p>{therapistName}</p>
                        <Rating name="stars-overview" value={reviewsData.avgStars} readOnly />
                    </div>
                    <div className="flex-col flex-centered thera-prof-top-right">
                        <h1>ABOUT ME</h1>
                        <p>{aboutMe}</p>
                    </div>
                </div>
                <div className="flex-col flex-centered thera-prof-mid">
                    <h1>AVAILABILITY</h1>
                    <p>{availability}</p>
                    <h1>PRICING</h1>
                    <p>{pricing}</p>
                    <button>Add/Rem Therapist</button>
                    <h1>Reviews</h1>
                    <div className="flex-centered flex-col">
                        <div className="flex-centered flex-row">
                            5<Rating name="5Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewsData.individualReviews[0].fives}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            4<Rating name="4Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewsData.individualReviews[0].fours}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            3<Rating name="3Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewsData.individualReviews[0].threes}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            2<Rating name="2Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewsData.individualReviews[0].twos}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            1<Rating name="1Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewsData.individualReviews[0].ones}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                    </div>
                    <div className="flex-centered flex-col">
                        <Rating name="1Stars" value={1} max={5} readOnly /><p>name of reviewer</p>&nbsp;<p>this guy sucks</p>
                    </div>
                    <p>for review text, use a map here in conjunction with mui stuff or DashboardCards</p>
                    <Pagination variant="text" shape="rounded" count={10} />
                    <button>add review</button>
                </div>
            </div >
        </>
    );
}

export default TherapistProfile;
