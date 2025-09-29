import React, { createContext, useContext, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ApiServiceContext = createContext();

export const useApiService = () => {
    const context = useContext(ApiServiceContext);
    if (!context) {
        throw new Error('useApiService must be used within an ApiServiceProvider');
    }
    return context;
};

export const ApiServiceProvider = ({ children }) => {
    const { authHeader, logout } = useAuth();

    const apiService = useMemo(() => {
        const instance = axios.create({
            baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1/`,
        });

        instance.interceptors.request.use(
            (config) => {
                const headers = authHeader();
                if (headers.Authorization) {
                    config.headers['Authorization'] = headers.Authorization;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        instance.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, [authHeader, logout]);

    return <ApiServiceContext.Provider value={apiService}>{children}</ApiServiceContext.Provider>;
};