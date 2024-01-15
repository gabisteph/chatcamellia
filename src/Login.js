import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const initialValues = {
    username: '',
    password: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Campo obrigatório'),
    password: Yup.string().required('Campo obrigatório'),
  });

  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const apiUrl = 'http://localhost:5000/login';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        console.error('Erro ao fazer login:', response.statusText);
        // Tratar erros mais detalhadamente, se necessário
        return null;
      }

      const userData = await response.json();

      if (response.ok) {
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
