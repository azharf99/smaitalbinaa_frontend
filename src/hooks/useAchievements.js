import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/achievements/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, {headers: { ...authHeader() }});
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },
    post: async (formData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { ...authHeader() },
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Invalid request payload.' }));
            throw new Error(JSON.stringify(errorData));
        }
        return response.json();
    },
    put: async (id, formData) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData,
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
        if (response.status !== 204 && !response.ok) {
             throw new Error('Failed to delete item');
        }
    },
});

export const useAchievements = () => {
    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const [items, setItems] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(API_URL);
    const [error, setError] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const refetch = () => setRefetchTrigger(prev => prev + 1);

    const fetchData = useCallback(async (loadMore = false) => {
        const urlToFetch = loadMore ? nextPageUrl : `${API_URL}?search=${searchQuery}`;
        if (!urlToFetch) return;

        loadMore ? setIsMoreLoading(true) : setIsInitialLoading(true);
        setError(null);

        try {
            const data = await apiService.get(urlToFetch);
            setItems(prev => loadMore ? [...prev, ...data.results] : data.results);
            setNextPageUrl(data.next);
        } catch (err) {
            setError('Could not load achievements. Please try again later.');
        } finally {
            loadMore ? setIsMoreLoading(false) : setIsInitialLoading(false);
        }
    }, [apiService, nextPageUrl, searchQuery]);

    useEffect(() => {
        fetchData(false);
    }, [refetchTrigger]);

    const saveAchievement = useCallback(async (formData, currentItem) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, formData);
            } else {
                await apiService.post(formData);
            }
            refetch();
        } catch (err) {
            console.error("Failed to save achievement:", err);
            alert(`Failed to save achievement. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [apiService]);

    const deleteAchievement = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            refetch();
        } catch (err) {
            setError(`Delete failed: ${err.message}.`);
        }
    }, [apiService]);

    const loadMore = () => fetchData(true);

    const setSearch = (query) => {
        setSearchQuery(query);
        refetch();
    };

    return { items, isInitialLoading, isMoreLoading, isSubmitting, error, nextPageUrl, loadMore, saveAchievement, deleteAchievement, setSearch };
};