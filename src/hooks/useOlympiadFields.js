import { useState, useEffect, useCallback } from 'react';
import { useApiService } from '../context/ApiServiceContext.jsx';

const useOlympiadFields = (page = 1, searchTerm = '') => {
    const [fields, setFields] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiService = useApiService();

    const fetchFields = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiService.get('olympiad-fields/', { params: { page, search: searchTerm } });
            setFields(response.data.results);
            setCount(response.data.count);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch olympiad fields:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [apiService, page, searchTerm]);

    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    const addField = async (fieldData) => {
        await apiService.post('olympiad-fields/', fieldData);
        fetchFields();
    };

    const updateField = async (id, fieldData) => {
        await apiService.put(`olympiad-fields/${id}/`, fieldData);
        fetchFields();
    };

    const deleteField = async (id) => {
        await apiService.delete(`olympiad-fields/${id}/`);
        fetchFields();
    };

    return {
        fields,
        count,
        isLoading,
        error,
        addField,
        updateField,
        deleteField,
        apiService,
    };
};

export default useOlympiadFields;