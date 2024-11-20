import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { DashboardCard } from '../components/DashboardCards.js';
import './styles/PatientDashboard.css'

function PatientDashboard() {
    const [callCount, setCallCount] = useState(0);
    const [journals, setJournals] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [dailySurveys, setDailySurveys] = useState([]);
    const [incompleteTherapistSurveys, setIncompleteTherapistSurveys] = useState([]);
    const [completeTherapistSurveys, setCompleteTherapistSurveys] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const navigate = useNavigate();

    const dailySurveyRefs = useRef({
        weight: null,
        height: null,
        calories: null,
        water: null,
        exercise: null,
        sleep: null,
        energy: null,
        stress: null
    });

    useEffect(() => {
        const socket = io('http://localhost:5000');

        const patientId = localStorage.getItem("userID");

        fetch('http://localhost:5000/patientDashboardData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patientId }), // Send patientId in the body
        })
            .then(res => res.json())
            .then(data => {
                //console.log(data[0]);
                //console.log(data[1]);
                //console.log(data[2]);
                //console.log(data[3]);
                //console.log(data[4]);
                //console.log(data[5]);
                setJournals(data[0]);
                setFeedback(data[1]);
                setDailySurveys(data[2]);
                setIncompleteTherapistSurveys(data[3]);
                setCompleteTherapistSurveys(data[4]);
                setInvoices(data[5]);
            })
            .catch(err => console.error('Error fetching data:', err));

        //  Connection
        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit("init-socket-comm", { "userID": patientId });
        });
        //  Disconnect
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        // Update surveys list
        socket.on('submit-daily-survey', () => {
            console.log('SURVEY SUCCESSFULLY SUBMITTED');
        })

        // Listen for new feedback from therapist
        socket.on('new-feedback', (data) => {
            setFeedback((prevFeedback) => [...prevFeedback, data.feedback]);
        });

        // Listen for new surveys from therapist
        socket.on('new-survey', (newSurvey) => {
            setIncompleteTherapistSurveys((prevSurveys) => [...prevSurveys, newSurvey]);
        });

        // Cleanup on component unmount
        return () => {
            socket.emit("rem-socket-comm", { "userID": patientId });
            socket.off('new-feedback');
            socket.off('new-survey');
            socket.disconnect();
        };
    }, [callCount]);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function displayPopUp(e, x) {
        if (x === 2) {
            await sleep(100);
        }
        const divParent = x === 1 ? e.target.parentElement.children[1] : e.target.parentElement.children[e.target.parentElement.children.length - 2].children[1];
        divParent.className = 'visible popUp-background';
    }

    function hidePopUp(e, x) {
        if (x === 1) {
            setCallCount(callCount + 1);
            const divParent = e.target.parentElement.parentElement.parentElement;
            console.log(divParent);
            divParent.className = 'hidden popUp-background';
        }
        else {
            setCallCount(callCount + 1);
            const divParent = e.target.parentElement.parentElement;
            console.log(divParent);
            divParent.className = 'hidden popUp-background';
        }

    }

    function saveJournal(e) {
        const newEntry = e.target.parentElement.parentElement.children[2];
        const patientId = localStorage.getItem("userID");
        const journalId = e.target.getAttribute('journalid');

        fetch('http://localhost:5000/saveJournal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "journalEntry": newEntry.value, patientId, journalId }),
        })
            .then(res => res.json())
            .then(data => {
                console.log("Successfully saved the journal");
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    function createJournal(e) {
        const newJournal = { journalID: null, journalEntry: '', timeDone: new Date().toISOString() };
        setJournals([...journals, newJournal]);
        displayPopUp(e, 2);
    }

    function submitDailySurvey(e, x) {
        e.preventDefault();

        const patientId = localStorage.getItem("userID");
        const dailySurveyID = e.target.getAttribute('dailysurveyid');
        //console.log("DAILY SURVEY ID: ", dailySurveyID);

        fetch('http://localhost:5000/completeDailySurvey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "fakeUserID": patientId, "dailySurveyID": dailySurveyID,
                "weight": dailySurveyRefs.current.weight.value, "height": dailySurveyRefs.current.height.value,
                "calories": dailySurveyRefs.current.calories.value, "water": dailySurveyRefs.current.water.value,
                "exercise": dailySurveyRefs.current.exercise.value, "sleep": dailySurveyRefs.current.sleep.value,
                "energy": dailySurveyRefs.current.energy.value, "stress": dailySurveyRefs.current.stress.value
            }),
        })
            .then(res => res.json())
            .then(data => {
                //console.log("Successfully saved the journal");
            })
            .catch(err => console.error('Error fetching data:', err));
        sleep(100)
        setCallCount(callCount + 1);
        hidePopUp(e, x);
    }

    function submitTherapistSurvey(e) {
        setCallCount(callCount + 1);
    }

    function payInvoice(e) {
        //console.log(e.target.getAttribute('invoiceid'));
        navigate('/payment', { type: 'invoice', id: e.target.getAttribute('invoiceid') })
    }

    return (
        <div className='patient-dashboard-container'>
            <h1>Welcome to your Patient Dashboard!</h1>
            {/* Display patient-specific content */}

            <div className="cards-container">
                <DashboardCard title="JOURNALS">
                    {journals && journals.map((row, index) => {
                        return (
                            <div key={`journal-${index}`}>
                                <input className='card-buttons' type='button' value={`Journal ${new Intl.DateTimeFormat('en-US').format(new Date(row.timeDone))}`} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>Journal Entry #{index + 1}</h2>
                                        <h3>Date Created: {new Date(row.timeDone).toDateString()}</h3>
                                        <textarea defaultValue={row.journalEntry}></textarea>
                                        <div>
                                            <input className='card-buttons' type='button' value={'CANCEL'} onClick={(e) => hidePopUp(e, 1)}></input>
                                            <input className='card-buttons' type='button' journalid={row.journalID} value={'SAVE'} onClick={(e) => saveJournal(e)}></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <input className='card-buttons' type='button' value={'CREATE NEW JOURNAL'} onClick={(e) => createJournal(e)}></input>
                </DashboardCard>

                <DashboardCard title="FEEDBACK">
                    {feedback && feedback.map((row, index) => {
                        return (
                            <div key={`feedback-${index}`}>
                                <input className='card-buttons' type='button' value={row.feedback} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>Feedback #{index + 1}</h2>
                                        <h3>Date Sent: {new Date(row.feedbackDate).toDateString()}</h3>
                                        <p>{row.feedback}</p>
                                        <div>
                                            <input className='card-buttons' type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e, 1)}></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DashboardCard>

                <DashboardCard title="DAILY SURVEYS">
                    {dailySurveys && dailySurveys.slice().reverse().map((row, index) => {
                        return (
                            <div key={`daily-survey-${index}`}>
                                <input
                                    type='button'
                                    className='card-buttons'
                                    dailysurveyid={row.dailySurveyID}
                                    value={row.weight !== null ? `COMPLETED Daily Survey ${new Intl.DateTimeFormat('en-US').format(new Date(row.dateCreated))}` : `(NEW) Daily Survey ${new Intl.DateTimeFormat('en-US').format(new Date(row.dateCreated))}`}
                                    onClick={(e) => displayPopUp(e, 1)}
                                />
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>Daily Survey #{index + 1}</h2>
                                        <h3>Date: {new Date(row.dateCreated).toDateString()}</h3>

                                        {row.weight !== null ? (
                                            <div className='flex-col'>
                                                <div className='questions-container'>
                                                    <div className='flex-col'>
                                                        <div>
                                                            <p>QUESTION #1: </p>
                                                            <input type='text' disabled value={row.weight}></input>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #2: </p>
                                                            <input type='text' disabled value={row.height}></input>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #3: </p>
                                                            <input type='text' disabled value={row.calories}></input>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #4: </p>
                                                            <input type='text' disabled value={row.water}></input>
                                                        </div>
                                                    </div>
                                                    <div className='flex-col'>
                                                        <div>
                                                            <p>QUESTION #5: </p>
                                                            <input type='text' disabled value={row.exercise}></input>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #6: </p>
                                                            <input type='text' disabled value={row.sleep}></input>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #7: </p>
                                                            <input type='text' disabled value={row.energy}></input>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #8: </p>
                                                            <input type='text' disabled value={row.stress}></input>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input className='card-buttons' type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e, 1)}></input>
                                            </div>
                                        ) : (
                                            <form className='flex-col' dailysurveyid={row.dailySurveyID} onSubmit={(e) => submitDailySurvey(e, 2)}>
                                                <div className='questions-container'>
                                                    <div className='flex-col'>
                                                        <div>
                                                            <p>QUESTION #1: Weight</p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.weight = el)}></textarea>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #2: Height </p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.height = el)}></textarea>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #3: Calories</p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.calories = el)}></textarea>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #4: Water</p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.water = el)}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className='flex-col'>
                                                        <div>
                                                            <p>QUESTION #5: Exercise</p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.exercise = el)}></textarea>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #6: Sleep</p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.sleep = el)}></textarea>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #7: Energy</p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.energy = el)}></textarea>
                                                        </div>
                                                        <div>
                                                            <p>QUESTION #8: Stress</p>
                                                            <textarea required ref={el => (dailySurveyRefs.current.stress = el)}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input className='card-buttons' type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e, 1)}></input>
                                                <input className='card-buttons' type='submit' value={'SUBMIT'}></input>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DashboardCard>

                <DashboardCard title="INVOICES">
                    {invoices && invoices.map((row, index) => {
                        return (
                            <input
                                className='card-buttons'
                                key={`invoice-${index}`}
                                invoiceid={row.invoiceID}
                                type='button'
                                value={`$${row.amountDue} Invoice to ${row.userName}`}
                                onClick={(e) => payInvoice(e)}
                            >
                            </input>
                        );
                    })}
                </DashboardCard>

                <DashboardCard title="THERAPIST SURVEYS">
                    {incompleteTherapistSurveys && incompleteTherapistSurveys.map((surveyObj, index) => {
                        // Parse the 'survey' JSON string into an array of questions
                        const questions = JSON.parse(surveyObj.survey);

                        return (
                            <div key={`incompleted-survey-${index}`}>
                                <input className='card-buttons' type='button' value={`(NEW) Survey ${new Intl.DateTimeFormat('en-US').format(new Date(surveyObj.dateCreated))}`} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>{surveyObj.userName}'s Survey</h2>
                                        {questions.map((question, questionIndex) => (
                                            <div key={questionIndex} className='flex-col'>
                                                <label>{question.question}</label>
                                                <input type='text' placeholder={question.questionType}></input>
                                            </div>
                                        ))}
                                        <div>
                                            <input className='card-buttons' type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e, 1)}></input>
                                            <input className='card-buttons' type='button' therapistsurveyid={surveyObj.surveyID} value={'SUBMIT'} onClick={(e) => submitTherapistSurvey(e)}></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {completeTherapistSurveys && completeTherapistSurveys.map((surveyObj, index) => {
                        const questions = JSON.parse(surveyObj.questions);
                        const answers = JSON.parse(surveyObj.answers);

                        return (
                            <div key={`completed-survey-${index}`}>
                                <input className='card-buttons' type='button' value={`COMPLETED Survey ${new Intl.DateTimeFormat('en-US').format(new Date(surveyObj.dateDone))}`} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>{surveyObj.userName}'s Survey</h2>
                                        {questions && questions.map((question, questionIndex) => (
                                            <div key={questionIndex} className='flex-col'>
                                                <label>{question.question}</label>
                                                <input type='text' disabled value={answers[0][`q${questionIndex + 1}`] || ''}></input>
                                            </div>
                                        ))}
                                        <div>
                                            <input className='card-buttons' type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e, 1)}></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DashboardCard>
            </div>
        </div>
    );
}

export default PatientDashboard;