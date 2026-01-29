import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../../supabaseClient'; // Import the client you just created

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session when the component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // Set loading to false once the session is fetched
    });

    // Listen for changes in authentication state (e.g., user signs in or out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // The value that will be provided to all consuming components
  const value = {
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    session, // The current user session object
  };

  // We only render the children (your app) when the initial loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to easily use the auth context in other components
export const useAuth = () => {
  return useContext(AuthContext);
};
