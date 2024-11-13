import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { DashboardCard } from '../components/DashboardCards.js';
import './styles/PatientDashboard.css'

const socket = io('http://localhost:5000');

function PatientDashboard() {
    const [updatedJournals, setUpdatedJournals] = useState(0);
    const [journals, setJournals] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [dailySurveys, setDailySurveys] = useState([]);
    const [incompleteTherapistSurveys, setIncompleteTherapistSurveys] = useState([]);
    const [completeTherapistSurveys, setCompleteTherapistSurveys] = useState([]);

    useEffect(() => {
        const patientId = localStorage.getItem("userID");
        //console.log("Patient ID: ", patientId)

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
                setJournals(data[0]);
                setFeedback(data[1]);
                setDailySurveys(data[2]);
                setIncompleteTherapistSurveys(data[3]);
                setCompleteTherapistSurveys(data[4]);
            })
            .catch(err => console.error('Error fetching data:', err));

        // Listen for new feedback from therapist
        socket.on('new-feedback', (newFeedback) => {
            setFeedback((prevFeedback) => [...prevFeedback, newFeedback]);
        });

        // Listen for new surveys from therapist
        socket.on('new-survey', (newSurvey) => {
            setIncompleteTherapistSurveys((prevSurveys) => [...prevSurveys, newSurvey]);
        });

        // Cleanup on component unmount
        return () => {
            socket.off('new-feedback');
            socket.off('new-survey');
        };
    }, [updatedJournals]);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function displayPopUp(e, x) {
        if (x === 2) {
            await sleep(100);
        }
        //console.log(e.target.parentElement.children[e.target.parentElement.children.length - 2].children[0]);
        const divParent = x === 1 ? e.target.parentElement.children[1] : e.target.parentElement.children[e.target.parentElement.children.length - 2].children[1];
        divParent.className = 'visible popUp-background';
    }

    function hidePopUp(e) {
        setUpdatedJournals(!updatedJournals);
        const divParent = e.target.parentElement.parentElement.parentElement;
        divParent.className = 'hidden popUp-background';
    }

    function saveJournal(e) {
        const newEntry = e.target.parentElement.parentElement.children[2];
        const patientId = localStorage.getItem("userID");
        const journalId = e.target.getAttribute('journalid');
        //console.log(journalId);

        fetch('http://localhost:5000/saveJournal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "journalEntry": newEntry.value, patientId, journalId }),
        })
            .then(res => res.json())
            .then(data => {
                //console.log("Successfully saved the journal");
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    function createJournal(e) {
        const newJournal = { journalID: null, journalEntry: '', timeDone: new Date().toISOString() };
        setJournals([...journals, newJournal]);
        displayPopUp(e, 2);
    }

    function submitDailySurvey(e) {

    }

    return (
        <div className='flex-col flex-centered'>
            <h1>Welcome to your Patient Dashboard!</h1>
            {/* Display patient-specific content */}

            <div className="cards-container">
                <DashboardCard title="JOURNALS">
                    {journals && journals.map((row, index) => {
                        return (
                            <div key={`journal-${index}`}>
                                <input type='button' value={'Journal'} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>Journal Entry #{index + 1}</h2>
                                        <h3>Date Created: {new Date(row.timeDone).toDateString()}</h3>
                                        <textarea defaultValue={row.journalEntry}></textarea>
                                        <div>
                                            <input type='button' value={'CANCEL'} onClick={(e) => hidePopUp(e)}></input>
                                            <input type='button' journalid={row.journalID} value={'SAVE'} onClick={(e) => saveJournal(e)}></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <input type='button' value={'CREATE NEW JOURNAL'} onClick={(e) => createJournal(e)}></input>
                </DashboardCard>

                <DashboardCard title="FEEDBACK">
                    {feedback && feedback.map((row, index) => {
                        return (
                            <div key={`feedback-${index}`}>
                                <input type='button' value={row.feedback} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>Feedback #{index + 1}</h2>
                                        <h3>Date Sent: {new Date(row.feedbackDate).toDateString()}</h3>
                                        <p>{row.feedback}</p>
                                        <div>
                                            <input type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e)}></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DashboardCard>

                <DashboardCard title="DAILY SURVEYS">
                    {dailySurveys && dailySurveys.map((row, index) => {
                        return (
                            <div key={`daily-survey-${index}`}>
                                <input
                                    type='button'
                                    dailysurveyid={row.dailySurveyID}
                                    value={row.weight !== null ? `COMPLETED Daily Survey ${new Intl.DateTimeFormat('en-US').format(new Date(row.dateCreated))}` : `(NEW) Daily Survey ${new Intl.DateTimeFormat('en-US').format(new Date(row.dateCreated))}`}
                                    onClick={(e) => displayPopUp(e, 1)}
                                />
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        <h2>Daily Survey #{index + 1}</h2>
                                        <h3>Date: {new Date(row.dateCreated).toDateString()}</h3>

                                        {row.weight !== null ? (
                                            <>
                                                <div>
                                                    <p>QUESTION #1: </p>
                                                    <p>ANSWER: {row.weight}</p>
                                                </div>
                                                <div>
                                                    <p>QUESTION #2: </p>
                                                    <p>ANSWER: {row.height}</p>
                                                </div>
                                                <div>
                                                    <p>QUESTION #3: </p>
                                                    <p>ANSWER: {row.calories}</p>
                                                </div>
                                                <div>
                                                    <p>QUESTION #4: </p>
                                                    <p>ANSWER: {row.water}</p>
                                                </div>
                                                <div>
                                                    <p>QUESTION #5: </p>
                                                    <p>ANSWER: {row.exercise}</p>
                                                </div>
                                                <div>
                                                    <p>QUESTION #6: </p>
                                                    <p>ANSWER: {row.sleep}</p>
                                                </div>
                                                <div>
                                                    <p>QUESTION #7: </p>
                                                    <p>ANSWER: {row.energy}</p>
                                                </div>
                                                <div>
                                                    <p>QUESTION #8: </p>
                                                    <p>ANSWER: {row.stress}</p>
                                                </div>
                                                <div>
                                                    <input type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e)}></input>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <p>QUESTION #1: Weight</p>
                                                    <textarea></textarea>
                                                </div>
                                                <div>
                                                    <p>QUESTION #2: Height </p>
                                                    <textarea></textarea>
                                                </div>
                                                <div>
                                                    <p>QUESTION #3: Calories</p>
                                                    <textarea></textarea>
                                                </div>
                                                <div>
                                                    <p>QUESTION #4: Water</p>
                                                    <textarea></textarea>
                                                </div>
                                                <div>
                                                    <p>QUESTION #5: Exercise</p>
                                                    <textarea></textarea>
                                                </div>
                                                <div>
                                                    <p>QUESTION #6: Sleep</p>
                                                    <textarea></textarea>
                                                </div>
                                                <div>
                                                    <p>QUESTION #7: Energy</p>
                                                    <textarea></textarea>
                                                </div>
                                                <div>
                                                    <p>QUESTION #8: Stress</p>
                                                    <textarea></textarea>
                                                </div>

                                                <div>
                                                    <input type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e)}></input>
                                                    <input type='button' dailysurveyid={row.dailySurveyID} value={'SUBMIT'} onClick={(e) => submitDailySurvey(e)}></input>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DashboardCard>

                <DashboardCard title="INVOICES">

                </DashboardCard>

                <DashboardCard title="THERAPIST SURVEYS">
                    {incompleteTherapistSurveys && incompleteTherapistSurveys.map((surveyObj, index) => {
                        // Parse the 'survey' JSON string into an array of questions
                        const questions = JSON.parse(surveyObj.survey);

                        return (
                            <div key={`incompleted-survey-${index}`}>
                                <input type='button' value={`Survey ${index + 1}`} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        {questions.map((question, questionIndex) => (
                                            <div key={questionIndex} className='flex-col'>
                                                <label>{question.question}</label>
                                                <input type='text' placeholder={question.questionType}></input>
                                            </div>
                                        ))}
                                        <div>
                                            <input type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e)}></input>
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
                                <input type='button' value={`COMPLETED Survey ${new Intl.DateTimeFormat('en-US').format(new Date(surveyObj.dateDone))}`} onClick={(e) => displayPopUp(e, 1)}></input>
                                <div className='hidden popUp-background'>
                                    <div className='popUp'>
                                        {questions && questions.map((question, questionIndex) => (
                                            <div key={questionIndex} className='flex-col'>
                                                <label>{question.question}</label>
                                                <input type='text' disabled value={answers[0][`q${questionIndex + 1}`] || ''}></input>
                                            </div>
                                        ))}
                                        <div>
                                            <input type='button' value={'CLOSE'} onClick={(e) => hidePopUp(e)}></input>
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