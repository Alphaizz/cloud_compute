<<<<<<< HEAD
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your page components
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// Import the new pages we will create next
import Profile from './pages/Profile';
import Chat from './pages/Chat';

// Import the PrivateRoute component
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      {/* These routes are accessible to everyone */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* --- Protected Routes --- */}
      {/* These routes are wrapped by PrivateRoute */}
      {/* If a user is not logged in, they will be redirected to /login */}
      
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
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
    </Routes>
  );
}
=======
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import DB from './pages/DB'
import Storage from './pages/Storage'
import Chat from './pages/Chat'

function App() {
  return (
    <BrowserRouter>
      <div style={{ marginBottom: 20 }}>
        <Link to="/">DB</Link> | <Link to="/storage">Storage</Link> | <Link to="/chat">Chat</Link>
      </div>

      <Routes>
        <Route path="/" element={<DB />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
>>>>>>> a949fc9b4fbfb7b4395d28a96cca36ee8440da6e
