import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/extracurricular-scores/`;

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

export const useExtracurricularScores = () => {
    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const [scores, setScores] = useState([]);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchScores = useCallback(async (urlOrQuery = API_URL) => {
        try {
            setLoading(true);
            let url = urlOrQuery;
            if (!urlOrQuery.startsWith('http')) {
                const searchParams = new URLSearchParams({ search: urlOrQuery });
                url = urlOrQuery ? `${API_URL}?${searchParams.toString()}` : API_URL;
            }
            const data = await apiService.get(url);
            setScores(data.results || []);
            setCount(data.count || 0);
            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
            setError(null);
        } catch (err) {
            setError(err);
            console.error('Error fetching extracurricular scores:', err);
            toast.error('Gagal memuat data nilai ekstrakurikuler.');
        } finally {
            setLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchScores();
    }, [fetchScores]);

    const createScore = useCallback(async (scoreData) => {
        try {
            const newScore = await apiService.post(scoreData);
            await fetchScores();
            toast.success('Nilai berhasil dibuat.');
            return newScore;
        } catch (err) {
            console.error('Error creating score:', err);
            let errorMessage = 'Gagal membuat nilai.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback
            }
            toast.error(errorMessage);
            throw err;
        }
    }, [apiService, fetchScores]);

    const updateScore = useCallback(async (id, scoreData) => {
        try {
            const updatedScore = await apiService.patch(id, scoreData);
            await fetchScores();
            toast.success('Nilai berhasil diperbarui.');
            return updatedScore;
        } catch (err) {
            console.error('Error updating score:', err);
            let errorMessage = 'Gagal memperbarui nilai.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback
            }
            toast.error(errorMessage);
            throw err;
        }
    }, [apiService, fetchScores]);

    const deleteScore = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            await fetchScores();
            toast.success('Nilai berhasil dihapus.');
        } catch (err) {
            console.error('Error deleting score:', err);
            toast.error('Gagal menghapus nilai.');
            throw err;
        }
    }, [apiService, fetchScores]);

    const handlePageChange = (url) => {
        if (url) fetchScores(url);
    };

    return { scores, count, nextPage, previousPage, loading, error, createScore, updateScore, deleteScore, handlePageChange, refetch: fetchScores };
};