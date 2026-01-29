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
