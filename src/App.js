import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Chat from './Chat';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/Signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        {/* Definir a página de login como a página inicial */}
        <Route
          path="/"
          element={<Navigate to="/Signup" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
