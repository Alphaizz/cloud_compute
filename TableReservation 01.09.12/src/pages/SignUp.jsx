import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // For success messages
  const [loading, setLoading] = useState(false);
  
  // Get the signUp function from our context
  const { signUp } = useAuth();

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    setLoading(true);
    
    // Call the signUp function from our AuthContext
    const { error } = await signUp(email, password);
    
    if (error) {
      setError(error.message); // If Supabase returns an error, display it
    } else {
      // Show a success message. By default, Supabase sends a confirmation email.
      setMessage('Registration successful! Please check your email to verify your account.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-2">Create an Account</h2>
          <p className="text-center text-gray-400 mb-8">Join us and reserve your table!</p>
          
          {/* Display error or success messages */}
          {error && <p className="bg-red-900 text-red-200 p-3 rounded-lg text-center mb-6">{error}</p>}
          {message && <p className="bg-green-900 text-green-200 p-3 rounded-lg text-center mb-6">{message}</p>}

          <form onSubmit={handleSignUpSubmit} className="space-y-6">
            {/* Note: The 'name' field was removed as Supabase auth doesn't handle it by default.
                You can add it back later and save it to a separate 'profiles' table. */}
            <div>
              <label htmlFor="email-signup" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                id="email-signup"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password-signup" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                id="password-signup"
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-amber-500 hover:text-amber-400">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
