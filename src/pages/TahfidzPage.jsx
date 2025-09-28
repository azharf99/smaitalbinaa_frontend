import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import { useTahfidz } from '../hooks/useTahfidz.js';

const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;
const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;

const initialState = {
    santri_id: '',
    pembimbing: '',
    hafalan: '',
    pencapaian_sebelumnya: '',
    pencapaian_sekarang: '',
    catatan: '',
    semester: 'Ganjil',
    academic_year: new Date().getFullYear().toString(),
};

const TahfidzForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchRelatedData = async () => {
            const fetchAll = async (url) => {
                let results = [];
                let nextUrl = url;
                while (nextUrl) {
                    const res = await fetch(nextUrl);
                    const data = await res.json();
                    results = results.concat(data.results || []);
                    nextUrl = data.next;
                }
                return results;
            };

            try {
                const [studentsData, teachersData] = await Promise.all([
                    fetchAll(STUDENTS_API_URL),
                    fetchAll(TEACHERS_API_URL),
                ]);
                setStudents(studentsData);
                setTeachers(teachersData);
            } catch (error) {
                console.error("Error fetching related data:", error);
            }
        };
        fetchRelatedData();
    }, []);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                ...initialState,
                ...currentItem,
                santri_id: currentItem.santri?.id || '',
                pembimbing: currentItem.pembimbing?.id || '',
            });
        } else {
            setFormData(initialState);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const isEditing = !!(currentItem && currentItem.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="santri_id" className="block text-sm font-medium text-gray-700">Santri</label>
                    <select name="santri_id" id="santri_id" value={formData.santri_id} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting || isEditing}>
                        <option value="">Select Santri</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.student_name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="pembimbing" className="block text-sm font-medium text-gray-700">Pembimbing</label>
                    <select name="pembimbing" id="pembimbing" value={formData.pembimbing} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting}>
                        <option value="">Select Pembimbing</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.teacher_name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="hafalan" className="block text-sm font-medium text-gray-700">Hafalan</label>
                    <input type="text" name="hafalan" id="hafalan" value={formData.hafalan} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="pencapaian_sebelumnya" className="block text-sm font-medium text-gray-700">Pencapaian Sebelumnya</label>
                    <input type="text" name="pencapaian_sebelumnya" id="pencapaian_sebelumnya" value={formData.pencapaian_sebelumnya} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="pencapaian_sekarang" className="block text-sm font-medium text-gray-700">Pencapaian Sekarang</label>
                    <input type="text" name="pencapaian_sekarang" id="pencapaian_sekarang" value={formData.pencapaian_sekarang} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                    <select name="semester" id="semester" value={formData.semester} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting}>
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <input type="text" name="academic_year" id="academic_year" value={formData.academic_year} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
            </div>
            <div>
                <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Catatan</label>
                <textarea name="catatan" id="catatan" value={formData.catatan} onChange={handleChange} rows="3" className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting}></textarea>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                </button>
            </div>
        </form>
    );
};

const TahfidzTable = ({ items, onEdit, onDelete, error, hasSearchQuery }) => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tahfidz Records</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Santri</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hafalan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pencapaian Sekarang</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Ajaran</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.santri?.student_name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.hafalan}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.pencapaian_sekarang}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.semester}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.academic_year}</td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : (
                       <tr><td colSpan={columns} className="px-6 py-4 text-center text-sm text-gray-500">
                           {hasSearchQuery ? 'No records match your search.' : 'No records found.'}
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 bg-gray-300 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody></table>
        </div>
    );
};

export default function TahfidzPage() {
    const {
        items,
        count,
        nextPage,
        previousPage,
        isDataLoading,
        isSubmitting,
        error,
        searchQuery,
        setSearchQuery,
        saveTahfidz,
        deleteTahfidz,
        handlePageChange
    } = useTahfidz();

    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { isAuthenticated } = useAuth();

    const handleSave = async (formData) => {
        try {
            await saveTahfidz(formData, currentItem);
            closeModal();
        } catch (err) {
            alert(`Failed to save record. Error: ${err.message}`);
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            await deleteTahfidz(id);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    }

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    return (
        <>
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Tahfidz Management</h1>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="btn-primary">
                        Add New Record
                    </button>
                )}
            </header>
            
            <div className="mb-4 flex justify-between items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by santri name..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>


            <main>
                {isDataLoading ? <LoadingTable /> : (
                    <>
                        <TahfidzTable items={items} onEdit={handleEdit} onDelete={handleDelete} error={error} hasSearchQuery={!!searchQuery} />
                        {count > 0 && (
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-700">Total {count} results</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="btn-secondary">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="btn-secondary">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Tahfidz Record' : 'Add Tahfidz Record'}>
                <TahfidzForm currentItem={currentItem} onSave={handleSave} onCancel={closeModal} isSubmitting={isSubmitting} />
            </Modal>
        </>
    );
}