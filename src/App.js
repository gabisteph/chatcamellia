// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import Login from './Login';
// import Signup from './Signup';
// import Home from './Home';
// import Chat from './Chat';
// import { ChatProvider } from './hook/useChat';
// import {ListProvider} from './hook/useUser';
// import {CurrentUserProvider} from './hook/usersContactList'
// import { SessionProvider } from './hook/useSession';


// function App() {
//   return (
//     <SessionProvider>
//     <ListProvider>
//     <CurrentUserProvider>
//     <ChatProvider>
//       <Router>
//         <Routes>
//           <Route path="/chatcamellia/login" element={<Login />} />
//           <Route path="/chatcamellia/signup" element={<Signup />} />
//           <Route path="/chatcamellia/home" element={<Home />} />
//           <Route path="/chatcamellia/chat" element={<Chat />} />
//           <Route
//             path="/"
//             element={<Navigate to="/signup" replace />}
//           />
//         </Routes>
//       </Router>
//       </ChatProvider>
//       </CurrentUserProvider>
//       </ListProvider>
//       </SessionProvider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Chat from './Chat';
import { ChatProvider } from './hook/useChat';
import { ListProvider } from './hook/useUser';
import { CurrentUserProvider } from './hook/usersContactList';
import { SessionProvider } from './hook/useSession';

import PrivateRoute from './PrivateRoute'; // Adjust the import path as necessary

function App() {
  return (
    <SessionProvider>
      <ListProvider>
        <CurrentUserProvider>
          <ChatProvider>
            <Router>
              <Routes>
                <Route path="/chatcamellia/login" element={<Login />} />
                <Route path="/chatcamellia/signup" element={<Signup />} />
                <Route
                  path="/home"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
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