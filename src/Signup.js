import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Formik, Field, Form, ErrorMessage } from 'formik'; // Add this line to import 'ErrorMessage'
import * as Yup from 'yup';
// import RSAHandler from './rsaKeyGeneration.js'
import { useNavigate } from 'react-router-dom';
// Define the initial form values and validation schema
const initialValues = {
  username: '',
  password: '',
};

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [registrationStatus, setRegistrationStatus] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate(); 
  const handleSubmit = (values) => {
    // Handle form submission here
  };

  const handleSignup = async () => {
    
    try {
      console.log('Request Body:', JSON.stringify(formData));
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      

      if (response.ok) {
        const responseData = await response.json();
        setRegistrationStatus('success');
        // sessionStorage.setItem('sid', responseData.sid);
        sessionStorage.setItem('userId', responseData.id_);
        sessionStorage.setItem('username', responseData.username);
        navigate('/home');
      } else {
        setRegistrationStatus('error');
        console.error('Signup error:', response.statusText);
      }
    } catch (error) {
      console.error('Signup error:', error.message);
      setRegistrationStatus('error');
    }
  };
  

  // useEffect(() => {
  //   // Establish WebSocket connection using the stored SID
  //   const socket = io('http://localhost:8000', {
  //     transports: ['websocket'],
  //     rejectUnauthorized: false,
  //     // query: {
  //     //   sid: sessionStorage.getItem('sid'),
  //     // },
  //   });

    // Handle WebSocket events as needed

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // Render your component JSX here
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
    <div className="auth">
      <div className="form-name">
        <label htmlFor="Login">Sign up</label>
      </div>
      <div className="form-group">
        <input
          type="text"
          id="username"
          name="username"
          placeholder="username"
          onChange={handleInputChange}
        />
        <div className="error-message">
          {/* Display validation error if any */}
          <ErrorMessage name="username" />
        </div>
      </div>

      <div className="form-group">
        <input
          type="password"
          id="password"
          name="password"
          placeholder="password"
          onChange={handleInputChange}
        />
        <div className="error-message">
          {/* Display validation error if any */}
          <ErrorMessage name="password" />
        </div>
      </div>

      <div className="form-group">
        <button type="button" className="submit-button" onClick={handleSignup}>
          Register
        </button>
      </div>

      <div className="link">
        <p>
          {/* Display registration status */}
          {registrationStatus === 'success' && <div>Registration successful!</div>}
          {registrationStatus === 'error' && <div>Registration failed. Please try again.</div>}
          {/* Link to login page */}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
    </Formik>
  );
};

export default Signup;
