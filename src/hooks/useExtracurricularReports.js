import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/extracurricular-reports/`;

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

export const useExtracurricularReports = () => {
    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const [reports, setReports] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const fetchReports = useCallback(async (searchQuery = '', { loadMore = false } = {}) => {
        try {
            loadMore ? setLoadingMore(true) : setLoading(true);

            const url = new URL(API_URL);
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const data = await apiService.get(url.toString());

            if (loadMore) {
                setReports(prev => [...prev, ...(data.results || [])]);
            } else {
                setReports(data.results || []);
            }
            setNextPage(data.next || null);
            setError(null);
        } catch (err) {
            setError(err);
            console.error('Error fetching extracurricular reports:', err);
            toast.error('Gagal memuat data laporan ekstrakurikuler.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const createReport = useCallback(async (reportData) => {
        try {
            const newReport = await apiService.post(reportData);
            await fetchReports();
            toast.success('Laporan berhasil dibuat.');
            return newReport;
        } catch (err) {
            console.error('Error creating report:', err);
            let errorMessage = 'Gagal membuat laporan.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) { /* Fallback */ }
            toast.error(errorMessage);
            throw err;
        }
    }, [apiService, fetchReports]);

    const updateReport = useCallback(async (id, reportData) => {
        try {
            const updatedReport = await apiService.patch(id, reportData);
            await fetchReports();
            toast.success('Laporan berhasil diperbarui.');
            return updatedReport;
        } catch (err) {
            console.error('Error updating report:', err);
            let errorMessage = 'Gagal memperbarui laporan.';
            try {
                const errorData = JSON.parse(err.message);
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
            } catch (e) { /* Fallback */ }
            toast.error(errorMessage);
            throw err;
        }
    }, [apiService, fetchReports]);

    const deleteReport = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            await fetchReports();
            toast.success('Laporan berhasil dihapus.');
        } catch (err) {
            console.error('Error deleting report:', err);
            toast.error('Gagal menghapus laporan.');
            throw err;
        }
    }, [apiService, fetchReports]);

    const loadMore = useCallback(async () => {
        if (nextPage) {
            setLoadingMore(true);
            try {
                const data = await apiService.get(nextPage);
                setReports(prev => [...prev, ...(data.results || [])]);
                setNextPage(data.next || null);
            } catch (err) {
                setError(err);
                console.error('Error loading more reports:', err);
                toast.error('Gagal memuat data selanjutnya.');
            } finally {
                setLoadingMore(false);
            }
        }
    }, [nextPage, apiService]);

    return { reports, loading, loadingMore, error, nextPage, createReport, updateReport, deleteReport, loadMore, refetch: fetchReports };
};