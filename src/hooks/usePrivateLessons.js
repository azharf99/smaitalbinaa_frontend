import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/private/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, { headers: { ...authHeader() } });
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, { method: 'POST', headers: { ...authHeader() }, body: data });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    patch: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, { method: 'PATCH', headers: { ...authHeader() }, body: data });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, { method: 'DELETE', headers: { ...authHeader() } });
        if (response.status !== 204 && !response.ok) throw new Error('Failed to delete');
    },
});

export const usePrivateLessons = () => {
    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const [lessons, setLessons] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const fetchLessons = useCallback(async (searchQuery = '', { loadMore = false } = {}) => {
        try {
            loadMore ? setLoadingMore(true) : setLoading(true);

            const url = new URL(API_URL);
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const data = await apiService.get(url.toString());

            if (loadMore) {
                setLessons(prev => [...prev, ...(data.results || [])]);
            } else {
                setLessons(data.results || []);
            }
            setNextPage(data.next || null);
            setError(null);
        } catch (err) {
            setError(err);
            console.error('Error fetching private lessons:', err);
            toast.error('Gagal memuat data bimbingan privat.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    const createLesson = useCallback(async (lessonData) => {
        try {
            const newLesson = await apiService.post(lessonData);
            await fetchLessons(); // Refetch to show the new item at the top
            toast.success('Laporan bimbingan berhasil dibuat.');
            return newLesson;
        } catch (err) {
            console.error('Error creating private lesson:', err);
            let errorMessage = 'Gagal membuat laporan bimbingan.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback for non-JSON error messages
            }
            window.alert(errorMessage);
            throw err;
        }
    }, [apiService, fetchLessons]);

    const updateLesson = useCallback(async (id, lessonData) => {
        try {
            const updatedLesson = await apiService.patch(id, lessonData);
            await fetchLessons(); // Refetch to show the updated item
            toast.success('Laporan bimbingan berhasil diperbarui.');
            return updatedLesson;
        } catch (err) {
            console.error('Error updating private lesson:', err);
            let errorMessage = 'Gagal memperbarui laporan bimbingan.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback for non-JSON error messages
            }
            window.alert(errorMessage);
            throw err;
        }
    }, [apiService, fetchLessons]);

    const deleteLesson = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            await fetchLessons(); // Refetch to remove the deleted item
            toast.success('Laporan bimbingan berhasil dihapus.');
        } catch (err) {
            console.error('Error deleting private lesson:', err);
            window.alert('Gagal menghapus laporan bimbingan.');
            throw err;
        }
    }, [apiService, fetchLessons]);

    const loadMore = useCallback(async () => {
        if (nextPage) {
            setLoadingMore(true);
            try {
                const data = await apiService.get(nextPage);
                setLessons(prev => [...prev, ...(data.results || [])]);
                setNextPage(data.next || null);
            } catch (err) {
                setError(err);
                console.error('Error loading more private lessons:', err);
                toast.error('Gagal memuat data selanjutnya.');
            } finally {
                setLoadingMore(false);
            }
        }
    }, [nextPage, apiService]);

    return { lessons, loading, loadingMore, error, nextPage, createLesson, updateLesson, deleteLesson, loadMore, refetch: fetchLessons };
};