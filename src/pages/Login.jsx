import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get the functions and state we need from our context and router
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // This line is key: it checks if we were redirected here. If so, it
  // gets the page we were trying to visit. Otherwise, it defaults to /profile.
  const from = location.state?.from?.pathname || "/profile";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Show loading indicator on the button
    
    // Call the signIn function from our AuthContext
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message); // If Supabase returns an error, display it
    } else {
      // On successful login, navigate to the page the user was originally
      // trying to access. The 'replace: true' option prevents the user
      // from hitting the back button and returning to the login page.
      navigate(from, { replace: true });
    }
    
    setLoading(false); // Hide loading indicator
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back!</h2>
          <p className="text-center text-gray-400 mb-8">Login to your account</p>
          
          {/* Display an error message if one exists */}
          {error && <p className="bg-red-900 text-red-200 p-3 rounded-lg text-center mb-6">{error}</p>}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-amber-800 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="text-center text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-amber-500 hover:text-amber-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
