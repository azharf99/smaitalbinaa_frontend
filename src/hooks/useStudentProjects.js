import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/student-projects/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, {headers: { ...authHeader() }});
        if (!response.ok) throw new Error('Failed to fetch student projects');
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...authHeader() 
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Invalid request payload.' }));
            throw new Error(JSON.stringify(errorData));
        }
        return response.json();
    },
    put: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                ...authHeader() 
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Invalid request payload.' }));
            throw new Error(JSON.stringify(errorData));
        }
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() }
        });
        if (!response.ok && response.status !== 204) {
             throw new Error('Failed to delete student project');
        }
    },
});

export const useStudentProjects = (initialSearchQuery = '') => {
    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const fetchData = useCallback(async (url) => {
        setIsDataLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            setItems(data.results || []);
            setCount(data.count || 0);
            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
        } catch (err) {
            setError('Could not load student projects. Please try again later.');
        } finally {
            setIsDataLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(`${API_URL}?search=${searchQuery}`);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, fetchData]);

    const saveStudentProject = useCallback(async (data, currentItem) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, data);
            } else {
                await apiService.post(data);
            }
            fetchData(`${API_URL}?search=${searchQuery}`); // Refetch
        } finally {
            setIsSubmitting(false);
        }
    }, [apiService, fetchData, searchQuery]);

    const deleteStudentProject = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            fetchData(`${API_URL}?search=${searchQuery}`); // Refetch
        } catch (err) {
            setError(`Delete failed: ${err.message}.`);
        }
    }, [apiService, fetchData, searchQuery]);

    const handlePageChange = (url) => {
        if (url) fetchData(url);
    };

    return { 
        items, 
        count, 
        nextPage, 
        previousPage, 
        isDataLoading, 
        isSubmitting, 
        error, 
        searchQuery, 
        setSearchQuery, 
        saveStudentProject, 
        deleteStudentProject, 
        handlePageChange 
    };
};
