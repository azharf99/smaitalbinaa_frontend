import { useState, useEffect, useCallback } from 'react';
import { useApiService } from '../context/ApiServiceContext.jsx';

const useOlympiadReports = (page = 1, searchTerm = '') => {
    const [reports, setReports] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiService = useApiService();

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiService.get('olympiad-reports/', { page, search: searchTerm });
            setReports(response.data.results);
            setCount(response.data.count);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch olympiad reports:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [apiService, page, searchTerm]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const addReport = async (reportData) => {
        await apiService.post('olympiad-reports/', reportData, { headers: { 'Content-Type': 'multipart/form-data' } });
        fetchReports();
    };

    const updateReport = async (id, reportData) => {
        await apiService.patch(`olympiad-reports/${id}/`, reportData, { headers: { 'Content-Type': 'multipart/form-data' } });
        fetchReports();
    };

    const deleteReport = async (id) => {
        await apiService.delete(`olympiad-reports/${id}/`);
        fetchReports();
    };

    return {
        reports,
        count,
        isLoading,
        error,
        addReport,
        updateReport,
        deleteReport,
        apiService,
    };
};

export default useOlympiadReports;