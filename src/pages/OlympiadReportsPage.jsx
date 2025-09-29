import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import OlympiadReportForm from '../components/OlympiadReportForm';
import Card from '../common/Card';
import CardSkeleton from '../common/CardSkeleton';
import SearchBar from '../common/SearchBar';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { useApiService } from '../context/ApiServiceContext.jsx';

const OlympiadReportsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [reportToDelete, setReportToDelete] = useState(null);
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
            setError('Failed to fetch olympiad reports data. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const url = `olympiad-reports/?search=${searchTerm}`;
            fetchReports(url);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, fetchReports]);

    const addReport = async (reportData) => {
        await apiService.post('olympiad-reports/', reportData, { headers: { 'Content-Type': 'multipart/form-data' } });
        fetchReports(`olympiad-reports/?search=${searchTerm}`);
    };

    const updateReport = async (id, reportData) => {
        await apiService.patch(`olympiad-reports/${id}/`, reportData, { headers: { 'Content-Type': 'multipart/form-data' } });
        fetchReports(`olympiad-reports/?search=${searchTerm}`);
    };

    const deleteReport = async (id) => {
        await apiService.delete(`olympiad-reports/${id}/`);
        fetchReports(`olympiad-reports/?search=${searchTerm}`);
    };

    const handlePageChange = (url) => {
        if (url) {
            fetchReports(url);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleOpenModal = (report = null) => {
        setCurrentReport(report);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentReport(null);
    };

    const handleOpenDeleteModal = (report) => {
        setReportToDelete(report);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setReportToDelete(null);
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentReport) {
                await updateReport(currentReport.id, formData);
                toast.success('Olympiad report updated successfully!');
            } else {
                await addReport(formData);
                toast.success('Olympiad report added successfully!');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save olympiad report:', error);
            toast.error(`Failed to save olympiad report: ${error.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteReport(reportToDelete.id);
            toast.success('Olympiad report deleted successfully!');
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Failed to delete olympiad report:', error);
            toast.error(`Failed to delete olympiad report: ${error.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const itemsPerPage = 12;

    const renderReportCard = (report) => (
        <Card
            key={report.id}
            item={report}
            onEdit={handleOpenModal}
            onDelete={handleOpenDeleteModal}
            title={`${report.field_name.field_name} (${report.field_name.type}) - ${report.report_date}`}
            imageUrl={report.report_photo}
        >
            <p className="text-gray-700 dark:text-gray-300 text-sm">
                <span className="font-semibold">Students: </span>
                {report.students.map(s => s.student_name).join(', ') || 'N/A'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                <span className="font-semibold">Notes: </span>
                {report.notes || 'No notes'}
            </p>
        </Card>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Olympiad Reports</h1>
            <div className="flex justify-between mb-4">
                <SearchBar onSearch={handleSearch} />
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Add Report
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: itemsPerPage }).map((_, index) => <CardSkeleton key={index} />)}
                </div>
            ) : error ? (
                <p className="text-red-500">Failed to load data.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {reports.map(renderReportCard)}
                </div>
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

            {isModalOpen && <OlympiadReportForm isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} report={currentReport} apiService={apiService} isSubmitting={isSubmitting} />}

            {isDeleteModalOpen && (
                <DeleteConfirmation
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                    itemName={`report for ${reportToDelete?.field_name.field_name} on ${reportToDelete?.report_date}`}
                    isDeleting={isSubmitting}
                />
            )}
        </div>
    );
};

export default OlympiadReportsPage;