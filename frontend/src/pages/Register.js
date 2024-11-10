import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../presets.css';
import './styles/Register.css';

function Register() {
    const [patientFormVisibility, setPatientFormVisibility] = useState("visible");
    const [therapistFormVisibility, setTherapistFormVisibility] = useState("hidden");
    const [pageOneVisibility, setPageOneVisibility] = useState("visible");
    const [pageTwoVisibility, setPageTwoVisibility] = useState("hidden");
    const [pageThreeVisibility, setPageThreeVisibility] = useState("hidden");

    //  Need this to redirect user to their dashboard page
    const navigate = useNavigate();

    const infoRefs = useRef({
        firstName: null,
        lastName: null,
        email: null,
        password: null,
        license: null,
        tosAgreement: null,
        patientBtn: null,
        therapistBtn: null
    });

    const insuranceRefs = useRef({
        company: null,
        id: null,
        tier: null
    });

    const answersRefs = useRef({
        weight: null,
        height: null,
        calories: null,
        water: null,
        exercise: null,
        sleep: null,
        energy: null,
        stress: null
    });

    const infoTherapistRefs = useRef({
        fname: null,
        lname: null,
        email: null,
        password: null,
        license: null,
        tosAgreement: null,
        gridContainer: null
    });

    function registerPatient(e) {
        e.preventDefault();
        const fname = infoRefs.current.firstName.value;
        const lname = infoRefs.current.lastName.value;
        const email = infoRefs.current.email.value;
        const password = infoRefs.current.password.value;
        const tosAgreement = infoRefs.current.tosAgreement.checked;
        console.log(tosAgreement);
        const company = insuranceRefs.current.company.value;
        const insuranceId = insuranceRefs.current.id.value;
        const tier = insuranceRefs.current.tier.value;
        const weight = answersRefs.current.weight.value;
        const height = answersRefs.current.height.value;
        const calories = answersRefs.current.calories.value;
        const water = answersRefs.current.water.value;
        const exercise = answersRefs.current.exercise.value;
        const sleep = answersRefs.current.sleep.value;
        const energy = answersRefs.current.energy.value;
        const stress = answersRefs.current.stress.value;

        fetch('http://localhost:5000/registerPatient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fname, lname, email, password, company, insuranceId, tier, weight, height, calories, water, exercise, sleep, energy, stress }),
        })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('userType', data.userType);
                navigate('/dashboard');
            })
            .catch(err => console.error('Error updating rental:', err));
    }

    function registerTherapist(e) {
        e.preventDefault();
    }

    function changeUserRegister(btn) {
        if (infoRefs.current.therapistBtn && infoRefs.current.patientBtn) {
            if (btn) {
                //  Swith to therapist button & de-select patient button
                infoRefs.current.therapistBtn.className = 'pt-button selected-pt-btn';
                infoRefs.current.patientBtn.className = 'pt-button';
                displayTherapistForm();
                hidePatientForm();
            } else {
                //  Do the opposite
                infoRefs.current.therapistBtn.className = 'pt-button';
                infoRefs.current.patientBtn.className = 'pt-button selected-pt-btn';
                displayPatientForm();
                hideTherapistForm();
            }
        }
    }

    //  Used to make the patient registration form visible
    function displayPatientForm() {
        setPatientFormVisibility("visible");
        setTherapistFormVisibility("hidden");
    }
    //  Used to hide the patient registration form
    function hidePatientForm() {
        setPatientFormVisibility("hidden");
        setTherapistFormVisibility("visible");
    }

    //  Used to make the therapist registration form visible
    function displayTherapistForm() {

    }
    //  Used to hide the therapist registration form
    function hideTherapistForm() {

    }

    function goToNextPage(e) {
        e.preventDefault();

        if (pageOneVisibility === 'visible') {
            setPageOneVisibility('hidden');
            setPageTwoVisibility('visible');
            setPageThreeVisibility('hidden');
        }
        else if (pageTwoVisibility === 'visible') {
            setPageOneVisibility('hidden');
            setPageTwoVisibility('hidden');
            setPageThreeVisibility('visible');
        }
    }

    function goToPreviousPage() {
        if (pageTwoVisibility === 'visible') {
            setPageOneVisibility('visible');
            setPageTwoVisibility('hidden');
            setPageThreeVisibility('hidden');
        }
        else if (pageThreeVisibility === 'visible') {
            setPageOneVisibility('hidden');
            setPageTwoVisibility('visible');
            setPageThreeVisibility('hidden');
        }
    }

    return (
        <>
            {/* Patient Registration Form */}
            <div className={patientFormVisibility}>

                {/* PAGE 1 OF 3 */}
                <div className={`form-container register-form ${pageOneVisibility}`}>
                    <h1>Register</h1>

                    <div className='text-centered'>
                        Are you a...
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <input type='button' value={'PATIENT'} className=' pt-button selected-pt-btn' ref={el => (infoRefs.current.patientBtn = el)} onClick={() => { changeUserRegister(0) }}></input>
                            <input type='button' value={'THERAPIST'} className='pt-button ' ref={el => (infoRefs.current.therapistBtn = el)} onClick={() => { changeUserRegister(1) }}></input>
                        </div>
                    </div>

                    <form onSubmit={(e) => goToNextPage(e)}>
                        <div>
                            <div className='flex-col userInput'>
                                <label>First Name</label>
                                <input type="text" required ref={el => (infoRefs.current.firstName = el)}></input>
                            </div>

                            <div className='flex-col userInput'>
                                <label>Last Name</label>
                                <input type="text" required ref={el => (infoRefs.current.lastName = el)}></input>
                            </div>

                            <div className='flex-col userInput'>
                                <label>Email</label>
                                <input type="text" required ref={el => (infoRefs.current.email = el)}></input>
                            </div>

                            <div className='flex-col userInput'>
                                <label>Password</label>
                                <input type="password" required ref={el => (infoRefs.current.password = el)}></input>
                            </div>
                        </div>
                        <div className='flex-centered checkboxInput'>
                            <input type='checkbox' required name='checkboxInput' ref={el => (infoRefs.current.tosAgreement = el)}></input>
                            <label htmlFor='checkboxInput'>
                                I agree to the Terms of Service.
                            </label>
                        </div>


                        <div className='flex-col margin-top-15'>
                            <input className='pageBtn' type='submit' value={'NEXT'}></input>
                        </div>
                    </form>
                </div>

                {/* PAGE 2 OF 3 */}
                <div className={`form-container register-form ${pageTwoVisibility}`}>
                    <div className='text-centered'>
                        <h1>Register</h1>
                        <h2 style={{ color: 'black', margin: '0px 0px 20px 0px' }}>Health Insurance (OPTIONAL)</h2>
                    </div>

                    <div>
                        <div className='flex-col userInput'>
                            <label>Insurance Company</label>
                            <input type="text" ref={el => (insuranceRefs.current.company = el)}></input>
                        </div>

                        <div className='flex-col userInput'>
                            <label>Insurance ID</label>
                            <input type="text" ref={el => (insuranceRefs.current.id = el)}></input>
                        </div>

                        <div className='flex-col userInput'>
                            <label>Insurance Tier</label>
                            <input type="text" ref={el => (insuranceRefs.current.tier = el)}></input>
                        </div>
                    </div>

                    <div>
                        <div className='flex-col margin-top-15'>
                            <input className='pageBtn' type='button' value={'BACK'} onClick={() => goToPreviousPage()}></input>
                        </div>
                        <div className='flex-col margin-top-15'>
                            <input className='pageBtn' type='button' value={'NEXT'} onClick={(e) => goToNextPage(e)}></input>
                        </div>
                    </div>
                </div>

                {/* PAGE 3 OF 3 */}
                <div className={`form-container register-form ${pageThreeVisibility}`}>
                    <div className='text-centered'>
                        <h1>Register</h1>
                        <h2 style={{ color: 'black', margin: '0px 0px 20px 0px' }}>Initial Questionnaire</h2>
                    </div>
                    <form onSubmit={(e) => registerPatient(e)}>
                        <div>
                            <div className='flex-row' style={{ justifyContent: 'space-between' }}>
                                <label>What is your current weight? (in pounds)</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.weight = el)}></input>
                            </div>

                            <div className='flex-row' style={{ justifyContent: 'space-between' }}>
                                <label>How tall are you? (in feet)</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.height = el)}></input>
                            </div>

                            <div className='flex-row' style={{ justifyContent: 'space-between' }}>
                                <label>On average, how many calories do you consume per day? (in kcal)</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.calories = el)}></input>
                            </div>

                            <div className='flex-row' style={{ justifyContent: 'space-between' }}>
                                <label>How many liters of water do you drink daily?</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.water = el)}></input>
                            </div>

                            <div className='flex-row' style={{ justifyContent: 'space-between' }}>
                                <label>How many minutes do you exercise each day on average?</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.exercise = el)}></input>
                            </div>

                            <div className='flex-row' style={{ justifyContent: 'space-between' }}>
                                <label>How many hours of sleep do you get per night on average?</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.sleep = el)}></input>
                            </div>

                            <div className='flex-row' style={{ justifyContent: 'space-between' }}>
                                <label>On a scale of 1 to 10, how would you rate your energy level this week?</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.energy = el)}></input>
                            </div>

                            <div className='flex-row ' style={{ justifyContent: 'space-between' }}>
                                <label>On a scale of 1 to 10, how would you rate your stress level this week?</label>
                                <input type="number" required className='userIntInput' ref={el => (answersRefs.current.stress = el)}></input>
                            </div>
                        </div>

                        <div>
                            <div className='flex-col margin-top-15'>
                                <input className='pageBtn' type='button' value={'BACK'} onClick={() => goToPreviousPage()}></input>
                            </div>
                            <div className='flex-col margin-top-15'>
                                <input className='registerBtn' type='submit' value={'REGISTER'}></input>
                            </div>
                        </div>
                    </form>

                </div>
            </div>

            {/* Therapist Registration Form */}
            <div className={therapistFormVisibility}>
                <div className='form-container'>
                    <h1>Register</h1>

                    <div className='text-centered'>
                        Are you a...
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <input type='button' value={'PATIENT'} className=' pt-button selected-pt-btn' ref={el => (infoRefs.current.patientBtn = el)} onClick={() => { changeUserRegister(0) }}></input>
                            <input type='button' value={'THERAPIST'} className='pt-button ' ref={el => (infoRefs.current.therapistBtn = el)} onClick={() => { changeUserRegister(1) }}></input>
                        </div>
                    </div>
                    <form onSubmit={(e) => registerTherapist(e)}>
                        <div className='flex-row'>
                            <div>
                                <div className='flex-col userInput'>
                                    <label>First Name</label>
                                    <input type="text" required ref={el => (infoTherapistRefs.current.fname = el)}></input>
                                </div>

                                <div className='flex-col userInput'>
                                    <label>Last Name</label>
                                    <input type="text" required ref={el => (infoTherapistRefs.current.lname = el)}></input>
                                </div>

                                <div className='flex-col userInput'>
                                    <label>Email</label>
                                    <input type="text" required ref={el => (infoTherapistRefs.current.email = el)}></input>
                                </div>

                                <div className='flex-col userInput'>
                                    <label>Password</label>
                                    <input type="password" required ref={el => (infoTherapistRefs.current.password = el)}></input>
                                </div>
                            </div>

                            <div id='therapistInfo'>
                                <div className='flex-col userInput'>
                                    <label>License Number</label>
                                    <input type="text" required ref={el => (infoTherapistRefs.current.license = el)}></input>
                                </div>
                                <div className='userInput'>
                                    <label>Specializations</label>
                                    <div className='grid-specs-container' required ref={el => (infoTherapistRefs.current.gridContainer = el)}>
                                        <input type='button' value={'Marriage'} className='grid-spec'></input>
                                        <input type='button' value={'Addiction'} className='grid-spec'></input>
                                        <input type='button' value={'Example 3'} className='grid-spec'></input>
                                        <input type='button' value={'Example 4'} className='grid-spec'></input>
                                        <input type='button' value={'Example 5'} className='grid-spec'></input>
                                        <input type='button' value={'Example 6'} className='grid-spec'></input>
                                        <input type='button' value={'Example 7'} className='grid-spec'></input>
                                        <input type='button' value={'Example 8'} className='grid-spec'></input>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='flex-centered checkboxInput'>
                                <input type='checkbox' name='checkboxInput' required ref={el => (infoTherapistRefs.current.tosAgreement = el)}></input>
                                <label htmlFor='checkboxInput'>
                                    I agree to the Terms of Service.
                                </label>
                            </div>
                            <div className='flex-col margin-top-15'>
                                <input className='registerBtn' type='submit' value={'REGISTER'}></input>
                            </div>
                        </div>
                    </form>


                </div>
            </div>
        </>
    );
}

export default Register;
