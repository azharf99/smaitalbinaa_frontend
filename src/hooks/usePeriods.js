import { useState, useEffect, useCallback } from 'react';
import { useApiService } from '../context/ApiServiceContext.jsx';

const usePeriods = (page = 1, searchTerm = '') => {
    const [periods, setPeriods] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiService = useApiService();

    const fetchPeriods = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiService.get('periods/', { params: { page, search: searchTerm } });
            setPeriods(response.data.results);
            setCount(response.data.count);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch periods:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [apiService, page, searchTerm]);

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    const addPeriod = async (data) => {
        await apiService.post('periods/', data);
        fetchPeriods();
    };

    const updatePeriod = async (id, data) => {
        await apiService.put(`periods/${id}/`, data);
        fetchPeriods();
    };

    const deletePeriod = async (id) => {
        await apiService.delete(`periods/${id}/`);
        fetchPeriods();
    };

    return {
        periods, count, isLoading, error, addPeriod, updatePeriod, deletePeriod, apiService,
    };
};

export default usePeriods;