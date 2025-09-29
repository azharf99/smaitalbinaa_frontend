import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/private-subjects/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, { headers: { ...authHeader() } });
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(data) });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    patch: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(data) });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, { method: 'DELETE', headers: { ...authHeader() } });
        if (response.status !== 204 && !response.ok) throw new Error('Failed to delete');
    },
});

export const usePrivateSubjects = () => {
    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const [subjects, setSubjects] = useState([]);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubjects = useCallback(async (urlOrQuery = API_URL) => {
        try {
            setLoading(true);
            let url = urlOrQuery;
            if (!urlOrQuery.startsWith('http')) {
                const searchParams = new URLSearchParams({ search: urlOrQuery });
                url = urlOrQuery ? `${API_URL}?${searchParams.toString()}` : API_URL;
            }
            const data = await apiService.get(url);
            setSubjects(data.results || []);
            setCount(data.count || 0);
            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
            setError(null);
        } catch (err) {
            setError(err);
            console.error('Error fetching private subjects:', err);
            toast.error('Gagal memuat data pelajaran privat.');
        } finally {
            setLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const createSubject = useCallback(async (subjectData) => {
        try {
            const newSubject = await apiService.post(subjectData);
            fetchSubjects(); // Refetch to get the latest paginated list
            toast.success('Pelajaran berhasil dibuat.');
            return newSubject;
        } catch (err) {
            console.error('Error creating private subject:', err);
            let errorMessage = 'Gagal membuat pelajaran.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback for non-JSON error messages
            }
            window.alert(errorMessage);
            throw err;
        }
    }, [apiService, fetchSubjects]);

    const updateSubject = useCallback(async (id, subjectData) => {
        try {
            const updatedSubject = await apiService.patch(id, subjectData);
            fetchSubjects(); // Refetch to get the latest paginated list
            toast.success('Pelajaran berhasil diperbarui.');
            return updatedSubject;
        } catch (err) {
            console.error('Error updating private subject:', err);
            let errorMessage = 'Gagal memperbarui pelajaran.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback for non-JSON error messages
            }
            window.alert(errorMessage);
            throw err;
        }
    }, [apiService, fetchSubjects]);

    const deleteSubject = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            fetchSubjects(); // Refetch to get the latest paginated list
            toast.success('Pelajaran berhasil dihapus.');
        } catch (err) {
            console.error('Error deleting private subject:', err);
            window.alert('Gagal menghapus pelajaran.');
            throw err;
        }
    }, [apiService, fetchSubjects]);

    const handlePageChange = (url) => {
        if (url) fetchSubjects(url);
    };

    return { subjects, count, nextPage, previousPage, loading, error, createSubject, updateSubject, deleteSubject, handlePageChange, refetch: fetchSubjects };
};