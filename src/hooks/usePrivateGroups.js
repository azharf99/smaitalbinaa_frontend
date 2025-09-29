import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/private-groups/`;

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

export const usePrivateGroups = () => {
    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const [groups, setGroups] = useState([]);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGroups = useCallback(async (urlOrQuery = API_URL) => {
        try {
            setLoading(true);
            let url = urlOrQuery;
            // Check if it's a search query (not a full URL)
            if (!urlOrQuery.startsWith('http')) {
                const searchParams = new URLSearchParams({ search: urlOrQuery });
                url = urlOrQuery ? `${API_URL}?${searchParams.toString()}` : API_URL;
            }
            const data = await apiService.get(url);
            setGroups(data.results || []);
            setCount(data.count || 0);
            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
            setError(null);
        } catch (err) {
            setError(err);
            console.error('Error fetching private groups:', err);
            toast.error('Gagal memuat data kelompok privat.');
        } finally {
            setLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const createGroup = useCallback(async (groupData) => {
        try {
            const newGroup = await apiService.post(groupData);
            await fetchGroups(); // Refetch to get the latest paginated list
            toast.success('Kelompok berhasil dibuat.');
            return newGroup;
        } catch (err) {
            console.error('Error creating private group:', err);
            let errorMessage = 'Gagal membuat kelompok.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback for non-JSON error messages
            }
            window.alert(errorMessage);
            throw err;
        }
    }, [apiService, fetchGroups]);

    const updateGroup = useCallback(async (id, groupData) => {
        try {
            const updatedGroup = await apiService.patch(id, groupData);
            await fetchGroups(); // Refetch to get the latest paginated list
            toast.success('Kelompok berhasil diperbarui.');
            return updatedGroup;
        } catch (err) {
            console.error('Error updating private group:', err);
            let errorMessage = 'Gagal memperbarui kelompok.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) {
                // Fallback for non-JSON error messages
            }
            window.alert(errorMessage);
            throw err;
        }
    }, [apiService, fetchGroups]);

    const deleteGroup = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            await fetchGroups(); // Refetch to get the latest paginated list
            toast.success('Kelompok berhasil dihapus.');
        } catch (err) {
            console.error('Error deleting private group:', err);
            window.alert('Gagal menghapus kelompok.');
            throw err;
        }
    }, [apiService, fetchGroups]);

    const handlePageChange = (url) => {
        if (url) fetchGroups(url);
    };

    return { groups, count, nextPage, previousPage, loading, error, createGroup, updateGroup, deleteGroup, handlePageChange, refetch: fetchGroups };
};