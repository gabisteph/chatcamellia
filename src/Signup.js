import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Formik, Field, Form, ErrorMessage } from 'formik'; // Add this line to import 'ErrorMessage'
import * as Yup from 'yup';
// import RSAHandler from './rsaKeyGeneration.js'
import { useNavigate } from 'react-router-dom';
import RSAHandler from './rsaKeyGeneration.js'

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
  const baseUrl = process.env.BASE_URL;

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [username, setUsername] = useState('')
  // const [users, setUsers] = useState([]) /// Lista de usuários que vai sendo atualizada para exibir na tela
  const [privateKey, setPrivateKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [sid, setSid] = useState('')
  
  const [MyUserPublicKey, setUserPublicKey] = useState('')

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate(); 
  const handleSubmit = (values) => {
    // Handle form submission here
  };
  function exportKey(key) {
    return window.crypto.subtle.exportKey('jwk', key)
}
  const publishPublicKey = async () => {
    const storedUsername = sessionStorage.getItem('username')
    setUsername(storedUsername)
    console.log('Username:', storedUsername)
    const NewSid = localStorage.getItem('Sid')


    setSid(NewSid)

    if (storedUsername && NewSid !== '');
    {
        setUsername(storedUsername)

        try {
            // Essas chaves precisam ser geradas todas as vezes que o usuário entrar no chat
            const keyPair = await RSAHandler.generateRsaKeys()
            console.log('Gerando as chaves')
            setPrivateKey(keyPair.privateKey)
            setPublicKey(keyPair.publicKey)
            console.log('Chave pública ->>>', keyPair.publicKey)
            console.log('Chave privada ->>>', keyPair.privateKey)
            // Export the key to a storable format (e.g., JWK)
            const user_id = sessionStorage.getItem('userId')
            const ExportedPublicKey = await exportKey(keyPair.publicKey)
            const ExportedPrivateKey = await exportKey(keyPair.privateKey)
            localStorage.setItem("myPrivateKey", JSON.stringify(ExportedPrivateKey));
            localStorage.setItem("myPublicKey", JSON.stringify(ExportedPublicKey));
            setUserPublicKey(ExportedPublicKey)
            
            const userRegisterData = JSON.stringify({
                user_id: user_id,
                public_key: ExportedPublicKey, // Exporting publicKey in a usable format
            })
            // console.log(userRegisterData);
            const response = await fetch(`${baseUrl}/update-public-key/${user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: userRegisterData
            });
        } catch (error) {
            console.error('error in publish public key:', error)
        }
    }
}


  const handleSignup = async () => {
    

    try {
      console.log('Request Body:', JSON.stringify(formData));
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      

      if (response.ok) {
        const responseData = await response.json();
        setRegistrationStatus('success');
        sessionStorage.setItem('userId', responseData.id_);
        sessionStorage.setItem('username', responseData.username);
        localStorage.setItem('userId', responseData.id_);
        localStorage.setItem('username', responseData.username);
        await publishPublicKey()
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
