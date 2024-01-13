import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Correção: Mudar 'elemento' para 'element' */}
        <Route path="/home" element={<Home />} />
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
