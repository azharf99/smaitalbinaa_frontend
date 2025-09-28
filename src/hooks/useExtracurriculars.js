import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/extracurriculars/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch extracurriculars');
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
    importCsv: async (formData) => {
        const response = await fetch(`${API_URL}import/`, {
            method: 'POST',
            headers: { ...authHeader() },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(JSON.stringify(await response.json().catch(() => ({ detail: 'Failed to import CSV.' }))));
        }
        return response.json();
    },
    exportCsv: async () => {
        const response = await fetch(`${API_URL}export/`, {
            headers: { ...authHeader() },
        });
        if (!response.ok) {
            throw new Error('Failed to export data.');
        }
        return response.blob();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() }
        });
        if (!response.ok && response.status !== 204) {
             throw new Error('Failed to delete extracurricular');
        }
    },
});

export const useExtracurriculars = (initialSearchQuery = '') => {
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
            setError('Could not load extracurriculars. Please try again later.');
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

    const saveExtracurricular = useCallback(async (formData, currentItem) => {
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

    const deleteExtracurricular = useCallback(async (id) => {
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

    const exportExtracurriculars = useCallback(async () => {
        try {
            const blob = await apiService.exportCsv();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Give the file a name
            a.download = `extracurriculars_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to export extracurriculars:", err);
            alert(`Failed to export data. Please try again later.`);
        }
    }, [apiService]);

    const importExtracurriculars = useCallback(async (file) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await apiService.importCsv(formData);
            fetchData(`${API_URL}?search=${searchQuery}`); // Refetch
        } finally {
            setIsSubmitting(false);
        }
    }, [apiService, fetchData, searchQuery]);


    return { items, count, nextPage, previousPage, isDataLoading, isSubmitting, error, searchQuery, setSearchQuery, saveExtracurricular, deleteExtracurricular, handlePageChange, exportExtracurriculars, importExtracurriculars };
};