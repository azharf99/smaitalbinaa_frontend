import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePrivateSubjects } from '../hooks/usePrivateSubjects';
import Modal from '../common/Modal.jsx';
import { debounce } from 'lodash';
import { SkeletonRow } from '../common/Skeleton.jsx';

const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;

const SubjectForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({ nama_pelajaran: '', pembimbing: [] });
    const { authHeader } = useAuth();

    useEffect(() => {
        if (currentItem) {
            setFormData({
                nama_pelajaran: currentItem.nama_pelajaran || '',
                pembimbing: (currentItem.pembimbing || []).map(t => ({ value: t.id, label: t.teacher_name }))
            });
        } else {
            setFormData({ nama_pelajaran: '', pembimbing: [] });
        }
    }, [currentItem]);

    const loadTeachers = async (inputValue) => {
        try {
            const response = await fetch(`${TEACHERS_API_URL}?search=${inputValue}`, { headers: { ...authHeader() } });
            const data = await response.json();
            return (data.results || []).map(t => ({ value: t.id, label: t.teacher_name }));
        } catch (error) {
            console.error("Error loading teachers:", error);
            return [];
        }
    };

    const debouncedLoadTeachers = debounce((inputValue, callback) => {
        loadTeachers(inputValue).then(callback);
    }, 300);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (selectedOptions) => {
        setFormData(prev => ({ ...prev, pembimbing: selectedOptions || [] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            nama_pelajaran: formData.nama_pelajaran,
            pembimbing_ids: formData.pembimbing.map(p => p.value)
        };
        onSave(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nama_pelajaran" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mata Pelajaran</label>
                <input type="text" name="nama_pelajaran" id="nama_pelajaran" value={formData.nama_pelajaran} onChange={handleChange} required className="mt-1 block w-full input-style" disabled={isSubmitting} />
            </div>
            <div>
                <label htmlFor="pembimbing" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pembimbing</label>
                <AsyncSelect isMulti id="pembimbing" name="pembimbing" value={formData.pembimbing} loadOptions={debouncedLoadTeachers} onChange={handleSelectChange} isDisabled={isSubmitting} className="react-select-container" classNamePrefix="react-select" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
            </div>
        </form>
    );
};

const PrivateSubjectPage = () => {
    const { subjects, count, nextPage, previousPage, loading, error, createSubject, updateSubject, deleteSubject, handlePageChange } = usePrivateSubjects();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (error) {
        return <div className="text-center py-10 text-red-500">Terjadi kesalahan saat memuat data.</div>;
    }

    const handleAddNew = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (subject) => {
        setCurrentItem(subject);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            await deleteSubject(id);
        }
    };

    const handleSave = async (subjectData) => {
        setIsSubmitting(true);
        try {
            if (currentItem) {
                await updateSubject(currentItem.id, subjectData);
            } else {
                await createSubject(subjectData);
            }
            setIsModalOpen(false);
            setCurrentItem(null);
        } catch (err) {
            // Error toast is handled in the hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pelajaran Bimbingan Privat</h1>
                    <button onClick={handleAddNew} className="btn-primary">
                        Add New Subject
                    </button>
                </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Mata Pelajaran
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Pembimbing
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => <SkeletonRow key={i} columns={3} />)
                            ) : subjects.length > 0 ? subjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {subject.nama_pelajaran}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {subject.pembimbing?.length
                                            ? subject.pembimbing.map(p => p.teacher_name).join(', ') 
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleEdit(subject)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Belum ada data pelajaran privat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                        Showing <span className="font-semibold">{subjects.length}</span> of <span className="font-semibold">{count}</span> results
                    </span>
                    <div className="inline-flex -space-x-px">
                        <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage || loading} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Previous</button>
                        <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage || loading} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Subject' : 'Add New Subject'}>
                <SubjectForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
};

export default PrivateSubjectPage;