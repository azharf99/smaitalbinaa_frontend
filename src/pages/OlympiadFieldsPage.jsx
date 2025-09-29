import React, { useState } from 'react';
import { toast } from 'react-toastify';
import useOlympiadFields from '../hooks/useOlympiadFields';
import OlympiadFieldForm from '../components/OlympiadFieldForm';
import Table from '../common/Table';
import TableSkeleton from '../common/TableSkeleton';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import DeleteConfirmation from '../common/DeleteConfirmation';

const OlympiadFieldsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [fieldToDelete, setFieldToDelete] = useState(null);

    const {
        fields,
        count,
        isLoading,
        error,
        addField,
        updateField,
        deleteField,
        apiService,
    } = useOlympiadFields(currentPage, searchTerm);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleOpenModal = (field = null) => {
        setCurrentField(field);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentField(null);
    };

    const handleOpenDeleteModal = (field) => {
        setFieldToDelete(field);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setFieldToDelete(null);
    };

    const handleSubmit = async (formData) => {
        try {
            if (currentField) {
                await updateField(currentField.id, formData);
                toast.success('Olympiad field updated successfully!');
            } else {
                await addField(formData);
                toast.success('Olympiad field added successfully!');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save olympiad field:', error);
            toast.error('Failed to save olympiad field.');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteField(fieldToDelete.id);
            toast.success('Olympiad field deleted successfully!');
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Failed to delete olympiad field:', error);
            toast.error('Failed to delete olympiad field.');
        }
    };

    const columns = [
        { header: 'Field Name', accessor: 'field_name' },
        { header: 'Type', accessor: 'type' },
        { header: 'Teacher', accessor: 'teacher.teacher_name' },
        { header: 'Schedule', accessor: 'schedule' },
        {
            header: 'Members',
            accessor: 'members',
            render: (members) => members.map(m => m.student_name).join(', ')
        },
    ];

    const itemsPerPage = 10;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Olympiad Fields</h1>
            <div className="flex justify-between mb-4">
                <SearchBar onSearch={handleSearch} />
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Add Field
                </button>
            </div>

            {isLoading ? (
                <TableSkeleton columns={columns.length} />
            ) : error ? (
                <p className="text-red-500">Failed to load data.</p>
            ) : (
                <Table
                    columns={columns}
                    data={fields}
                    onEdit={handleOpenModal}
                    onDelete={handleOpenDeleteModal}
                />
            )}

            <Pagination
                currentPage={currentPage}
                totalItems={count}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />

            {isModalOpen && (
                <OlympiadFieldForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    field={currentField}
                    apiService={apiService}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteConfirmation
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDelete}
                    itemName={fieldToDelete?.field_name}
                />
            )}
        </div>
    );
};

export default OlympiadFieldsPage;