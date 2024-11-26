import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './styles/TherapistProfile.css';
import '../presets.css';
import { Rating, Slider, Pagination } from '@mui/material';

function TherapistProfile() {
    const { userId } = useParams();
    const [therapistName, setTherapistName] = useState("Loading Name");
    const [aboutMe, setAboutMe] = useState("Loading about me");
    const [education, setEducation] = useState("Loading education");
    const [availability, setAvailability] = useState("Loading availability");
    const [pricing, setPricing] = useState("Loading pricing");
    const [specializations, setSpecializations] = useState("Loading specializations");
    const [reviews, setReviews] = useState();
    const [reviewSummary, setReviewSummary] = useState({ "avgStars": 0, "individualReviews": [{ "fives": 5, "fours": 4, "threes": 3, "twos": 2, "ones": 1 }] });
    const [totalReviews, setTotalReviews] = useState(0);
    const [page, setPage] = useState(1);
    // const pageRef = useRef(null);

    useEffect(() => {
        fetch(`http://localhost:5000/therapistProfileInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ realUserId: userId }),
        })
            .then(res => res.json())
            .then(data => {
                console.log("all else", data);
                setTherapistName(data.Therapist[0]);
                setAboutMe(data.Therapist[1]);
                setEducation(data.Therapist[2]);
                setAvailability(data.Therapist[3]);
                setPricing(data.Therapist[4]);
                setSpecializations(data.Therapist[5]);
                let totRevs = data.fives + data.fours + data.threes + data.twos + data.ones
                let avgStars = (5 * data.fives + 4 * data.fours + 3 * data.threes + 2 * data.twos + data.ones) / totRevs
                setReviewSummary({ "avgStars": avgStars, "individualReviews": [{ "fives": data.fives, "fours": data.fours, "threes": data.threes, "twos": data.twos, "ones": data.ones }] });
                setTotalReviews(totRevs);
            })
            .catch(err => console.error('Error fetching data:', err));

        fetch(`http://localhost:5000/therapistReviewInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ realUserId: userId, page: page }),
        })
            .then(res => res.json())
            .then(data => {
                setReviews(data.reviews);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/therapistReviewInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ realUserId: userId, page: page }),
        })
            .then(res => res.json())
            .then(data => {
                console.log("reviews text", data);
                setReviews(data.reviews);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, [page]);

    const paginationFunc = (event, value) => {
        setPage(value);
    }

    return (
        <>
            <div className="flex-col main-container flex-centered">
                <div className="flex-row">
                    <div className="flex-col flex-centered thera-prof-top-left">
                        <p>PFP here</p>
                        <p>{therapistName}</p>
                        <Rating name="stars-overview" value={reviewSummary.avgStars} precision={0.1} readOnly />
                    </div>
                    <div className="flex-col flex-centered thera-prof-top-right">
                        <h1>ABOUT ME</h1>
                        <p><strong>Specializations: </strong>{specializations}</p>
                        <p><strong>Education: </strong>{education}</p>
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
                                value={reviewSummary.individualReviews[0].fives}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            4<Rating name="4Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewSummary.individualReviews[0].fours}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            3<Rating name="3Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewSummary.individualReviews[0].threes}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            2<Rating name="2Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewSummary.individualReviews[0].twos}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                        <div className="flex-centered flex-row">
                            1<Rating name="1Stars" value={1} max={1} readOnly />
                            <Slider
                                value={reviewSummary.individualReviews[0].ones}
                                max={totalReviews}
                                sx={{ width: "400px", '& .MuiSlider-thumb': { display: 'none' } }}
                                disabled />
                        </div>
                    </div>
                    {reviews && reviews.map((item, index) => (
                        <div className="flex-centered flex-col">
                            <div className="flex-centered flex-row">
                                <p>{item[3]}, {item[2]}</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Rating name="1Stars" value={item[1]} max={5} readOnly />
                            </div>
                            <p>{item[0]}</p>
                        </div>
                    ))}
                    <Pagination variant="text" shape="rounded" count={Math.ceil(totalReviews / 4)} onChange={paginationFunc} />
                    <button>add review</button>
                </div>
            </div >
        </>
    );
};

export default TherapistProfile;