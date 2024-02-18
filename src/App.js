import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Chat from './Chat';
import { ChatProvider } from './hook/useChat';
import {ListProvider} from './hook/useUser';
import {CurrentUserProvider} from './hook/usersContactList'
import { SessionProvider } from './hook/useSession';

function App() {
  return (
    <SessionProvider>
    <ListProvider>
    <CurrentUserProvider>
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
      </CurrentUserProvider>
      </ListProvider>
      </SessionProvider>
  );
}

export default App;
