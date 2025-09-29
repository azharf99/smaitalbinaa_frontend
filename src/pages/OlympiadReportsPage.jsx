import React, { useState } from 'react';
import { toast } from 'react-toastify';
import useOlympiadReports from '../hooks/useOlympiadReports';
import OlympiadReportForm from '../components/OlympiadReportForm';
import Card from '../common/Card';
import CardSkeleton from '../common/CardSkeleton';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import DeleteConfirmation from '../common/DeleteConfirmation';

const OlympiadReportsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [reportToDelete, setReportToDelete] = useState(null);

    const {
        reports,
        count,
        isLoading,
        error,
        addReport,
        updateReport,
        deleteReport,
        apiService,
    } = useOlympiadReports(currentPage, searchTerm);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
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
            toast.error('Failed to save olympiad report.');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteReport(reportToDelete.id);
            toast.success('Olympiad report deleted successfully!');
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Failed to delete olympiad report:', error);
            toast.error('Failed to delete olympiad report.');
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

            <Pagination currentPage={currentPage} totalItems={count} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />

            {isModalOpen && <OlympiadReportForm isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} report={currentReport} apiService={apiService} />}

            {isDeleteModalOpen && <DeleteConfirmation isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleDelete} itemName={`report for ${reportToDelete?.field_name.field_name} on ${reportToDelete?.report_date}`} />}
        </div>
    );
};

export default OlympiadReportsPage;