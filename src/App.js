import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Chat from './Chat';
import { ChatProvider } from './hook/useChat';

function App() {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route
            path="/"
            element={<Navigate to="/signup" replace />}
          />
        </Routes>
      </Router>
    </ChatProvider>
  );
}

export default App;
