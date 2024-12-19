import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../presets.css';
import './styles/Login.css';
import showPassword from './assets/images/show-password.png';
import hidePassword from './assets/images/hide-password.png';

function Login() {
    const inputRefs = useRef({
        email: null,
        password: null
    });

    const passRef = useRef(null);

    const navigate = useNavigate();

    function checkLogin(e) {
        e.preventDefault();
        const email = inputRefs.current.email.value;
        const password = inputRefs.current.password.value;

        fetch('http://backend:5000/api/login', {  // Use Docker service name for backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('userType', 'User');
                    navigate('/dashboard');
                } else {
                    alert('Login failed. Please try again.');
                }
            })
            .catch(err => console.error('Error fetching data:', err));
    }

    function togglePasswordVisibility() {
        if (inputRefs.current.password.type === 'password') {
            inputRefs.current.password.type = 'text';
            passRef.current.src = showPassword;
            passRef.current.style.top = '44px';
        } else {
            inputRefs.current.password.type = 'password';
            passRef.current.src = hidePassword;
            passRef.current.style.top = '42px';
        }
    }

    return (
        <div className="default-form-container">
            <h1>LOG IN</h1>
            <form onSubmit={checkLogin}>
                <div className='flex-col input-container'>
                    <label>Email</label>
                    <input type="text" className='email-input' ref={el => (inputRefs.current.email = el)} required={true}></input>
                </div>

                <div className='flex-col input-container'>
                    <label>Password</label>
                    <input type="password" className='password-input' ref={el => (inputRefs.current.password = el)}></input>
                    <img
                        src={hidePassword}
                        alt='reveal-password'
                        ref={el => (passRef.current = el)}
                        className='password-toggle-btn'
                        onClick={() => togglePasswordVisibility()}
                    />
                </div>

                <div className='flex-col flex-centered margin-top-15'>
                    <input className='loginBtn' type='submit' value={'LOG IN'}></input>
                    <div className='flex-row flex-centered redirect-register'>
                        New to MentCare?&nbsp;
                        <Link to={'/register'} className='clickable-register'>Register Now</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Login;
