import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePrivateGroups } from '../hooks/usePrivateGroups';
import Modal from '../common/Modal.jsx';
import { debounce } from 'lodash';
import { SkeletonRow } from '../common/Skeleton.jsx';

const SUBJECTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/private-subjects/`;
const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;

const GroupForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({ nama_kelompok: '', jenis_kelompok: '', pelajaran: null, jadwal: '', waktu: '', santri: [] });
    const { authHeader } = useAuth();

    useEffect(() => {
        if (currentItem) {
            setFormData({
                nama_kelompok: currentItem.nama_kelompok || '',
                jenis_kelompok: currentItem.jenis_kelompok || '',
                pelajaran: currentItem.pelajaran ? { value: currentItem.pelajaran.id, label: currentItem.pelajaran.nama_pelajaran } : null,
                jadwal: currentItem.jadwal || '',
                waktu: currentItem.waktu || '',
                santri: (currentItem.santri || []).map(s => ({ value: s.id, label: s.student_name }))
            });
        } else {
            setFormData({ nama_kelompok: '', jenis_kelompok: '', pelajaran: null, jadwal: '', waktu: '', santri: [] });
        }
    }, [currentItem]);

    const loadOptions = async (apiUrl, inputValue, mapping) => {
        try {
            const response = await fetch(`${apiUrl}?search=${inputValue}`, { headers: { ...authHeader() } });
            const data = await response.json();
            return (data.results || data).map(mapping);
        } catch (error) {
            console.error("Error loading options:", error);
            return [];
        }
    };

    const debouncedLoadSubjects = debounce((inputValue, callback) => {
        loadOptions(SUBJECTS_API_URL, inputValue, s => ({ value: s.id, label: s.nama_pelajaran })).then(callback);
    }, 300);

    const debouncedLoadStudents = debounce((inputValue, callback) => {
        loadOptions(STUDENTS_API_URL, inputValue, s => ({ value: s.id, label: s.student_name })).then(callback);
    }, 300);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption || (name === 'santri' ? [] : null) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            pelajaran: formData.pelajaran?.value,
            santri: formData.santri.map(s => s.value)
        };
        onSave(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="nama_kelompok" placeholder="Nama Kelompok" value={formData.nama_kelompok} onChange={handleChange} required className="input-style" />
                <input type="text" name="jenis_kelompok" placeholder="Jenis Kelompok" value={formData.jenis_kelompok} onChange={handleChange} className="input-style" />
                <AsyncSelect cacheOptions defaultOptions loadOptions={debouncedLoadSubjects} value={formData.pelajaran} onChange={val => handleSelectChange('pelajaran', val)} placeholder="Pilih Pelajaran" className="react-select-container" classNamePrefix="react-select" />
                <input type="text" name="jadwal" placeholder="Jadwal (e.g. Senin, Selasa)" value={formData.jadwal} onChange={handleChange} className="input-style" />
                <input type="text" name="waktu" placeholder="Waktu (e.g. 13:00 - 14:00)" value={formData.waktu} onChange={handleChange} className="input-style" />
            </div>
            <div>
                <label htmlFor="santri" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Santri</label>
                <AsyncSelect isMulti cacheOptions defaultOptions loadOptions={debouncedLoadStudents} value={formData.santri} onChange={val => handleSelectChange('santri', val)} placeholder="Pilih Santri" className="react-select-container" classNamePrefix="react-select" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
            </div>
        </form>
    );
};

const PrivateGroupPage = () => {
    const { groups, count, nextPage, previousPage, loading, error, createGroup, updateGroup, deleteGroup, handlePageChange } = usePrivateGroups();
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

    const handleEdit = (group) => {
        setCurrentItem(group);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            await deleteGroup(id);
        }
    };

    const handleSave = async (groupData) => {
        setIsSubmitting(true);
        try {
            if (currentItem) {
                await updateGroup(currentItem.id, groupData);
            } else {
                await createGroup(groupData);
            }
            closeModal();
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kelompok Bimbingan Privat</h1>
                    <button onClick={handleAddNew} className="btn-primary">
                        Add New Group
                    </button>
                </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Nama Kelompok
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Jenis Kelompok
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Pelajaran
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Jadwal
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Waktu
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Santri
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => <SkeletonRow key={i} columns={7} />)
                            ) : groups.length > 0 ? groups.map((group) => (
                                <tr key={group.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {group.nama_kelompok}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {group.jenis_kelompok || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {group.pelajaran?.nama_pelajaran || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {group.jadwal || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {group.waktu || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {(group.santri || []).map(s => s.student_name).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleEdit(group)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(group.id)} className="`text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Belum ada data kelompok privat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                        Showing <span className="font-semibold">{groups.length}</span> of <span className="font-semibold">{count}</span> results
                    </span>
                    <div className="inline-flex -space-x-px">
                        <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage || loading} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Previous</button>
                        <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage || loading} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Group' : 'Add New Group'}>
                <GroupForm currentItem={currentItem} onSave={handleSave} onCancel={closeModal} isSubmitting={isSubmitting} />
            </Modal>
        </>
    );
};

export default PrivateGroupPage;