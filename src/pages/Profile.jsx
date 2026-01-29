import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    // Get the session and signOut function from our auth context
    const { session, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Profile</h2>
                <p className="text-gray-400 mb-2">You are logged in as:</p>
                
                {/* Display the user's email from the session object */}
                <p className="text-amber-400 font-mono bg-gray-900 p-3 rounded-lg mb-8 break-all">
                    {session?.user?.email}
                </p>
                
                <Link to="/" className="text-amber-500 hover:text-amber-400 mb-6 inline-block">
                    &larr; Back to Home
                </Link>
                
                <button 
                    onClick={signOut} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
