import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const SocialAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setSocialAuthTokens } = useAuth();

    useEffect(() => {
        // Parse the query parameters from the URL
        const params = new URLSearchParams(location.search);
        const access = params.get('access');
        const refresh = params.get('refresh');

        if (access && refresh) {
            // If tokens are found, store them using the AuthContext
            setSocialAuthTokens({ access, refresh });
            // Redirect to the main calendar page
            navigate('/'); 
        } else {
            // If no tokens are found, something went wrong. Redirect to login.
            navigate('/login');
        }
    }, [location, navigate, setSocialAuthTokens]);

    // Display a loading message while the redirect is happening
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Finalizing login...</p>
            </div>
        </div>
    );
};

export default SocialAuthCallback;

