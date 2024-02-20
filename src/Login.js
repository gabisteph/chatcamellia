import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import RSAHandler from './rsaKeyGeneration.js'


const Login = () => {
  const initialValues = {
    username: '',
    password: '',
  };
  function exportKey(key) {
    return window.crypto.subtle.exportKey('jwk', key)
}
  const [privateKey, setPrivateKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [sid, setSid] = useState('')
  
  const [MyUserPublicKey, setUserPublicKey] = useState('')

  const validationSchema = Yup.object({
    username: Yup.string().required('Campo obrigatório'),
    password: Yup.string().required('Campo obrigatório'),
  });

  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const baseUrl = process.env.REACT_APP_BASE_URL;
      const apiUrl = `${baseUrl}/login`;
      console.log(values)
      const credentials = new URLSearchParams();
      credentials.append('username', values.username);
      credentials.append('password', values.password);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // body: JSON.stringify(values),
        body: credentials
      });

      if (!response.ok) {
        console.error('Erro ao fazer login:', response.statusText);
        // Tratar erros mais detalhadamente, se necessário
        
        return null;
      }

      const userData = await response.json();

      if (response.ok) {
        // Notificar o backend sobre a mudança de status
        localStorage.setItem('isAuthenticated','true')

        await notifyStatusChange(true);
        if (localStorage.getItem('myPrivateKey') !== null) {
          // The key exists in localStorage

          try {
            // Essas chaves precisam ser geradas todas as vezes que o usuário entrar no chat
            const keyPair = await RSAHandler.generateRsaKeys()

            setPrivateKey(keyPair.privateKey)
            setPublicKey(keyPair.publicKey)
            // Export the key to a storable format (e.g., JWK)
            const user_id = userData.user.id_
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
          
          console.log('The information is still in localStorage.');
        }
        sessionStorage.setItem('isAuthenticated', 'true');

        // Navegar para a tela de home após o login bem-sucedido
        navigate('/home', { replace: true });
      }

      return userData;
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      // Tratar erros mais detalhadamente, se necessário
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Função para notificar o backend sobre a mudança de status
  const notifyStatusChange = async (online) => {
    try {
      const apiUrl = 'http://25.6.211.198:8000/status/change';

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ online }),
      });
    } catch (error) {
      console.error('Erro ao notificar mudança de status:', error.message);
      // Tratar erros mais detalhadamente, se necessário
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleLogin}
    >
      <Form className="auth">
        <div className="form-name">
          <label htmlFor="Login">Login</label>
        </div>
        <div className="form-group">
          <Field type="text" id="username" name="username" placeholder="username" />
          <ErrorMessage name="username" component="div" className="error-message" />
        </div>

        <div className="form-group">
          <Field type="password" id="password" name="password" placeholder="password"/>
          <ErrorMessage name="password" component="div" className="error-message" />
        </div>

        <div className="form-group">
          <button type="submit" className="submit-button">
            Entrar
          </button>
        </div>
        <div className="link">
          <p>
            <Link to="/Signup">Sign Up</Link>
          </p>
        </div>
      </Form>
    </Formik>
  );
};

export default Login;
