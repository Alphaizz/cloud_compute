import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { session } = useAuth(); // Use the hook to get session
    const location = useLocation();

    // If there is no active session, the user is not logged in
    if (!session) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If there is a session, render the child components (the protected page)
    return children;
};

export default PrivateRoute;
