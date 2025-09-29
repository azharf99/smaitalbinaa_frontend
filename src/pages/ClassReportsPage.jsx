import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import ClassReportForm from '../components/ClassReportForm';
import Table from '../common/Table';
import TableSkeleton from '../common/TableSkeleton';
import SearchBar from '../common/SearchBar';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { useApiService } from '../context/ApiServiceContext.jsx';

const ClassReportsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reports, setReports] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const apiService = useApiService();

    const fetchReports = useCallback(async (url) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            setReports(data.data.results || []);
            setCount(data.data.count || 0);
            setNextPage(data.data.next || null);
            setPreviousPage(data.data.previous || null);
        } catch (err) {
            setError('Failed to fetch class reports. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const url = `class-reports/?search=${searchTerm}`;
            fetchReports(url);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, fetchReports]);

    const addReport = async (data) => {
        await apiService.post('class-reports/', data);
        fetchReports(`class-reports/?search=${searchTerm}`);
    };

    const updateReport = async (id, data) => {
        await apiService.put(`class-reports/${id}/`, data);
        fetchReports(`class-reports/?search=${searchTerm}`);
    };

    const deleteReport = async (id) => {
        await apiService.delete(`class-reports/${id}/`);
        fetchReports(`class-reports/?search=${searchTerm}`);
    };

    const handlePageChange = (url) => {
        if (url) fetchReports(url);
    };

    const handleSearch = (term) => setSearchTerm(term);
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
                await updateReport(currentItem.id, formData);
                toast.success('Report updated successfully!');
            } else {
                await addReport(formData);
                toast.success('Report added successfully!');
            }
            handleCloseModal();
        } catch (err) {
            toast.error(`Failed to save report: ${err.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteReport(itemToDelete.id);
            toast.success('Report deleted successfully!');
            handleCloseDeleteModal();
        } catch (err) {
            toast.error(`Failed to delete report: ${err.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { header: 'Date', accessor: 'report_date' },
        { header: 'Course', accessor: 'schedule.schedule_course' },
        { header: 'Class', accessor: 'schedule.schedule_class' },
        { header: 'Teacher', accessor: 'schedule.teacher.teacher_name' },
        { header: 'Status', accessor: 'status' },
        { header: 'Substitute', accessor: 'subtitute_teacher.teacher_name' },
    ];

    const itemsPerPage = 10;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Class Reports</h1>
            <div className="flex justify-between mb-4">
                <SearchBar onSearch={handleSearch} />
                <button onClick={() => handleOpenModal()} className="btn-primary">Add Report</button>
            </div>
            {isLoading ? <TableSkeleton columns={columns.length} /> : error ? <p className="text-red-500">{error}</p> : <Table columns={columns} data={reports} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />}
            {count > itemsPerPage && (
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Total {count} results</span>
                    <div className="flex space-x-2">
                        <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="btn-secondary">Previous</button>
                        <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="btn-secondary">Next</button>
                    </div>
                </div>
            )}
            {isModalOpen && <ClassReportForm isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} item={currentItem} apiService={apiService} isSubmitting={isSubmitting} />}
            {isDeleteModalOpen && <DeleteConfirmation isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleDelete} itemName={`report on ${itemToDelete?.report_date}`} isDeleting={isSubmitting} />}
        </div>
    );
};

export default ClassReportsPage;