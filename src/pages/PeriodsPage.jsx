import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import PeriodForm from '../components/PeriodForm';
import Table from '../common/Table';
import TableSkeleton from '../common/TableSkeleton';
import SearchBar from '../common/SearchBar';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { useApiService } from '../context/ApiServiceContext.jsx';

const PeriodsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [periods, setPeriods] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const apiService = useApiService();

    const fetchPeriods = useCallback(async (url) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            setPeriods(data.data.results || []);
            setCount(data.data.count || 0);
            setNextPage(data.data.next || null);
            setPreviousPage(data.data.previous || null);
        } catch (err) {
            setError('Failed to fetch periods data. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const url = `periods/?search=${searchTerm}`;
            fetchPeriods(url);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, fetchPeriods]);

    const addPeriod = async (data) => {
        await apiService.post('periods/', data);
        fetchPeriods(`periods/?search=${searchTerm}`);
    };

    const updatePeriod = async (id, data) => {
        await apiService.put(`periods/${id}/`, data);
        fetchPeriods(`periods/?search=${searchTerm}`);
    };

    const deletePeriod = async (id) => {
        await apiService.delete(`periods/${id}/`);
        fetchPeriods(`periods/?search=${searchTerm}`);
    };

    const handlePageChange = (url) => {
        if (url) {
            fetchPeriods(url);
        }
    };
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleOpenDeleteModal = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentItem) {
                await updatePeriod(currentItem.id, formData);
                toast.success('Period updated successfully!');
            } else {
                await addPeriod(formData);
                toast.success('Period added successfully!');
            }
            handleCloseModal();
        } catch (err) {
            toast.error(`Failed to save period: ${err.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await deletePeriod(itemToDelete.id);
            toast.success('Period deleted successfully!');
            handleCloseDeleteModal();
        } catch (err) {
            toast.error(`Failed to delete period: ${err.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { header: 'Number', accessor: 'number' },
        { header: 'Time Start', accessor: 'time_start' },
        { header: 'Time End', accessor: 'time_end' },
        { header: 'Short Time Start', accessor: 'short_time_start' },
        { header: 'Short Time End', accessor: 'short_time_end' },
        { header: 'Type', accessor: 'type' },
    ];

    const itemsPerPage = 10;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Periods</h1>
            <div className="flex justify-between mb-4">
                <SearchBar onSearch={handleSearch} />
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed">
                    Add Period
                </button>
            </div>

            {isLoading ? (
                <TableSkeleton columns={columns.length} />
            ) : error ? (
                <p className="text-red-500">Failed to load data.</p>
            ) : (
                <Table columns={columns} data={periods} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
            )}

            {count > itemsPerPage && (
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Total {count} results</span>
                    <div className="flex space-x-2">
                        <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Previous</button>
                        <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Next</button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <PeriodForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    item={currentItem}
                    isSubmitting={isSubmitting}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteConfirmation
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                    itemName={`period number ${itemToDelete?.number}`}
                    isDeleting={isSubmitting}
                />
            )}
        </div>
    );
};

export default PeriodsPage;