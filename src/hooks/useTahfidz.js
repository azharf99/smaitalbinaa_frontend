import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/tahfidz/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, { headers: { ...authHeader() } });
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    put: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() },
        });
        if (response.status !== 204 && !response.ok) throw new Error('Failed to delete');
    },
});

export const useTahfidz = (initialSearchQuery = '') => {
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
            setError('Could not load Tahfidz records. Please try again later.');
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

    const saveTahfidz = useCallback(async (formData, currentItem) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, formData);
            } else {
                await apiService.post(formData);
            }
            fetchData(`${API_URL}?search=${searchQuery}`); // Refetch
        } finally {
            setIsSubmitting(false);
        }
    }, [apiService, fetchData, searchQuery]);

    const deleteTahfidz = useCallback(async (id) => {
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

    return { items, count, nextPage, previousPage, isDataLoading, isSubmitting, error, searchQuery, setSearchQuery, saveTahfidz, deleteTahfidz, handlePageChange };
};