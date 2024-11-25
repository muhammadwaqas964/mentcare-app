import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TherapistProfile = () => {
  const { userId } = useParams();
  const [therapist, setTherapist] = useState(null);

  // Fetch therapist details by user ID
  useEffect(() => {
    fetch(`http://localhost:5000/api/therapists/${userId}`)
      .then((response) => response.json())
      .then((data) => setTherapist(data.Therapist))
      .catch((error) => console.error('Error fetching therapist:', error));
  }, [userId]);

  if (!therapist) return <p>Loading...</p>;

  return (
    <div>
      <h1>{therapist.Username}'s Profile</h1>
      <p><strong>Intro:</strong> {therapist.Intro}</p>
      <p><strong>Education:</strong> {therapist.Education}</p>
      <p><strong>License Number:</strong> {therapist.LicenseNumber}</p>
      <p><strong>Availability:</strong> {therapist.DaysHours}</p>
      <p><strong>Price:</strong> ${therapist.Price}</p>
      <p><strong>Specializations:</strong> {therapist.Specializations}</p>
    </div>
  );
};

export default TherapistProfile;

