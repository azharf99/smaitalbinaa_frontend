import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import ReporterScheduleForm from '../components/ReporterScheduleForm';
import Table from '../common/Table';
import TableSkeleton from '../common/TableSkeleton';
import SearchBar from '../common/SearchBar';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { useApiService } from '../context/ApiServiceContext.jsx';

const ReporterSchedulesPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const apiService = useApiService();

    const fetchReporterSchedules = useCallback(async (url) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            setSchedules(data.data.results || []);
            setCount(data.data.count || 0);
            setNextPage(data.data.next || null);
            setPreviousPage(data.data.previous || null);
        } catch (err) {
            setError('Failed to fetch reporter schedules data. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const url = `reporter-schedules/?search=${searchTerm}`;
            fetchReporterSchedules(url);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, fetchReporterSchedules]);

    const addSchedule = async (data) => {
        await apiService.post('reporter-schedules/', data);
        fetchReporterSchedules(`reporter-schedules/?search=${searchTerm}`);
    };

    const updateSchedule = async (id, data) => {
        await apiService.put(`reporter-schedules/${id}/`, data);
        fetchReporterSchedules(`reporter-schedules/?search=${searchTerm}`);
    };

    const deleteSchedule = async (id) => {
        await apiService.delete(`reporter-schedules/${id}/`);
        fetchReporterSchedules(`reporter-schedules/?search=${searchTerm}`);
    };

    const handlePageChange = (url) => {
        if (url) {
            fetchReporterSchedules(url);
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
                await updateSchedule(currentItem.id, formData);
                toast.success('Reporter schedule updated successfully!');
            } else {
                await addSchedule(formData);
                toast.success('Reporter schedule added successfully!');
            }
            handleCloseModal();
        } catch (err) {
            toast.error(`Failed to save schedule: ${err.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteSchedule(itemToDelete.id);
            toast.success('Reporter schedule deleted successfully!');
            handleCloseDeleteModal();
        } catch (err) {
            toast.error(`Failed to delete schedule: ${err.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { header: 'Day', accessor: 'schedule_day' },
        { header: 'Time', accessor: 'schedule_time' },
        { header: 'Reporter', accessor: 'reporter.teacher_name' },
        { header: 'Time Start', accessor: 'time_start' },
        { header: 'Time End', accessor: 'time_end' },
        { header: 'Type', accessor: 'type' },
    ];

    const itemsPerPage = 10;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Reporter Schedules</h1>
            <div className="flex justify-between mb-4">
                <SearchBar onSearch={handleSearch} />
                <button onClick={() => handleOpenModal()} className="btn-primary">
                    Add Schedule
                </button>
            </div>

            {isLoading ? (
                <TableSkeleton columns={columns.length} />
            ) : error ? (
                <p className="text-red-500">Failed to load data.</p>
            ) : (
                <Table columns={columns} data={schedules} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
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
                <ReporterScheduleForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    item={currentItem}
                    apiService={apiService}
                    isSubmitting={isSubmitting}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteConfirmation
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                    itemName={`reporter schedule for ${itemToDelete?.reporter?.teacher_name} on ${itemToDelete?.schedule_day}`}
                    isDeleting={isSubmitting}
                />
            )}
        </div>
    );
};

export default ReporterSchedulesPage;