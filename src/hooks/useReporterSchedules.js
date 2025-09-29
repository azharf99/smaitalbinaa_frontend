import { useState, useEffect, useCallback } from 'react';
import { useApiService } from '../context/ApiServiceContext.jsx';

const useReporterSchedules = (page = 1, searchTerm = '') => {
    const [schedules, setSchedules] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiService = useApiService();

    const fetchSchedules = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiService.get('reporter-schedules/', { params: { page, search: searchTerm } });
            setSchedules(response.data.results);
            setCount(response.data.count);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch reporter schedules:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [apiService, page, searchTerm]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const addSchedule = async (data) => {
        await apiService.post('reporter-schedules/', data);
        fetchSchedules();
    };

    const updateSchedule = async (id, data) => {
        await apiService.put(`reporter-schedules/${id}/`, data);
        fetchSchedules();
    };

    const deleteSchedule = async (id) => {
        await apiService.delete(`reporter-schedules/${id}/`);
        fetchSchedules();
    };

    return {
        schedules, count, isLoading, error, addSchedule, updateSchedule, deleteSchedule, apiService,
    };
};

export default useReporterSchedules;