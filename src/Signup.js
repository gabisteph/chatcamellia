import React from 'react'
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Login.css'
import { Link } from 'react-router-dom';

const Signup = () => {
    const initialValues = {
      username: '',
      password: '',
      repeatpassword: '',
    };
  
    const validationSchema = Yup.object({
      username: Yup.string().required('Campo obrigatório'),
      password: Yup.string().required('Campo obrigatório'),
      repeatpassword: Yup.string().required('Campo obrigatório'),
    });
  
    const handleSubmit = async (values, { setSubmitting }) => {
      try {
        const apiUrl = 'http://localhost:5000/register';   // URL da API
  
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
  
        if (!response.ok) {
          console.error('Erro ao criar usuário:', response.statusText);
          // Se possível, adicione uma lógica para exibir mensagens de erro mais detalhadas para o usuário.
          return null;
        }
  
        const data = await response.json();
        console.log('Usuário criado com sucesso:', data);
        return data;
      } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        return null;
      } finally {
        // Remova console.log sensíveis
        setSubmitting(false);
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
            <Field type="password" id="repeatpassword" name="repeatpassword" placeholder="repeat password"/>
            <ErrorMessage name="repeatpassword" component="div" className="error-message" />
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