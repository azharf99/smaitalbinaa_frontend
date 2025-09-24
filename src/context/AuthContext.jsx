import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getInitialUser = () => {
    const authTokens = localStorage.getItem('authTokens');
    if (!authTokens) return null;

    try {
        const decodedUser = jwtDecode(JSON.parse(authTokens).access);
        const isExpired = Date.now() >= decodedUser.exp * 1000;
        if (isExpired) {
            localStorage.removeItem('authTokens');
            return null;
        }
        return decodedUser;
    } catch (error) {
        console.error("Invalid token on initial load:", error);
        localStorage.removeItem('authTokens');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser);
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') 
            ? JSON.parse(localStorage.getItem('authTokens')) 
            : null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false); // Used for initial auth check
    const navigate = useNavigate();
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (authTokens) {
            setUser(jwtDecode(authTokens.access));
        } else {
            setUser(null);
        }
    }, [authTokens, navigate]);

    const login = useCallback(async (username, password) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/');
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(() => {
        setIsLoading(true);
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
        setIsLoading(false);
    }, [navigate]);

    const setSocialAuthTokens = useCallback((tokens) => {
        if (tokens && tokens.access && tokens.refresh) {
            setAuthTokens(tokens);
            setUser(jwtDecode(tokens.access));
            localStorage.setItem('authTokens', JSON.stringify(tokens));
        } else {
            console.error("Invalid tokens received for social auth.");
        }
    }, []);

    const authHeader = useCallback(() => {
        return authTokens ? { 'Authorization': 'Bearer ' + String(authTokens.access) } : {};
    }, [authTokens]);

    const contextData = useMemo(() => ({
        user,
        authTokens,
        isAuthLoading,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setSocialAuthTokens,
        authHeader,
    }), [user, authTokens, isAuthLoading, isLoading, login, logout, setSocialAuthTokens, authHeader]);

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
