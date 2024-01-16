import React from 'react'
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Login.css'
import { Link } from 'react-router-dom';

const Signup = () => {
    const initialValues = {
      username: '',
      password: '',
    };
  
    const validationSchema = Yup.object({
      username: Yup.string().required('Campo obrigatório'),
      password: Yup.string().required('Campo obrigatório'),
    });
  
    const handleSubmit = async (values, { setSubmitting }) => {
      try {
        
        const apiUrl = 'http://0.0.0.0:8000/register'; 
        console.log('Enviando solicitação para:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        console.log('Resposta do servidor:', response);

        if (!response.ok) {
          console.error('Erro ao criar usuário:', response.statusText);
          // Adicione mais logs ou mensagens de erro conforme necessário
          return null;
        }
  
        const data = await response.json();
        console.log('Usuário criado com sucesso:', data);
        return data;
      } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        return null;
      } 
    };
  
  
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="auth">
          <div className="form-name">
            <label htmlFor="Login">Sign up</label>
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
           <button type="submit" className="submit-button">Register</button>
          </div>

          <div className="link">
          <p>
          <Link to="/Login">Login</Link>
          </p>
            {/* <p><a href="./Singup" target="_new" rel="noopener noreferrer">Sign up</a></p> */}
        </div>
        </Form>
      </Formik>
    );
  };

export default Signup;