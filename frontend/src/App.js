import React from 'react';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

function App() {
  return (

    <Router>
      <Navbar />
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} /> 
        {/* In testing still, just type in the usertype of who you want, and the therapistID/patientID of the person.
        So the userType decides if therapistID or patientID. Please let me know if it is not working. Might be some
        differences in databases. */}
        <Route path='/chat' element={<Chat userType={"Patient"} chooseId={1}/>} />
      </Routes >
    </Router >

  )
}

export default App;