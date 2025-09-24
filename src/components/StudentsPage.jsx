import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';

// --- Helper Functions & Initial State ---
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/students/`;
const CLASSES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/classes/`;

const initialState = {
    nis: '',
    nisn: '',
    student_name: '',
    student_class: null, // Assuming you'll handle class selection, for now it's null
    gender: 'L',
    address: '',
    student_birth_place: '',
    student_birth_date: '',
    email: '',
    phone: '',
    student_status: 'Aktif',
    photo: null,
    academic_year: '',
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// --- API Service ---
const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch students');
        return response.json();
    },
    post: async (formData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { ...authHeader() },
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
        return response.json();
    },
    put: async (id, formData) => {
        // The photo might not be sent on every update, so the backend should handle partial updates.
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() }
        });
        if (!response.ok && response.status !== 204) {
             throw new Error('Failed to delete student');
        }
        return response;
    },
});

// --- UI Components ---

const StudentForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        // Fetch classes for the dropdown
        const fetchClasses = async () => {
            try {
                const response = await fetch(CLASSES_API_URL);
                if (!response.ok) throw new Error('Failed to fetch classes');
                let data = await response.json();
                // Handle paginated and non-paginated responses for classes
                if (data.results) {
                    // In a real-world scenario with many classes, you might need to fetch all pages.
                    setClasses(data.results);
                } else {
                    setClasses(data);
                }
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (currentItem) {
            const { photo, ...rest } = currentItem;
            setFormData({
                ...initialState,
                ...rest,
                student_class: currentItem.student_class?.id || null,
                student_birth_date: formatDateForInput(currentItem.student_birth_date),
            });
        } else {
            setFormData(initialState);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        // Loop through formData and append to FormData object
        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        }
        onSave(data);
    };

    const isEditing = !!(currentItem && currentItem.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="student_name" className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input type="text" id="student_name" name="student_name" placeholder="Student Name" value={formData.student_name || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="nis" className="block text-sm font-medium text-gray-700">NIS</label>
                    <input type="text" id="nis" name="nis" placeholder="NIS" value={formData.nis || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="student_class" className="block text-sm font-medium text-gray-700">Class</label>
                    <select name="student_class" id="student_class" value={formData.student_class || ''} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting}>
                        <option value="">Select a class</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="nisn" className="block text-sm font-medium text-gray-700">NISN</label>
                    <input type="text" id="nisn" name="nisn" placeholder="NISN" value={formData.nisn || ''} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting}>
                        <option value="L">Laki-Laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="student_birth_place" className="block text-sm font-medium text-gray-700">Birth Place</label>
                    <input type="text" id="student_birth_place" name="student_birth_place" placeholder="Birth Place" value={formData.student_birth_place || ''} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="student_birth_date" className="block text-sm font-medium text-gray-700">Birth Date</label>
                    <input type="date" id="student_birth_date" name="student_birth_date" value={formData.student_birth_date || ''} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" id="phone" name="phone" placeholder="Phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
            </div>
            <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo</label>
                <input type="file" name="photo" id="photo" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" disabled={isSubmitting} />
                {isEditing && currentItem.photo && <p className="text-xs text-gray-500 mt-1">Current photo will be replaced if you upload a new one.</p>}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                </button>
            </div>
        </form>
    );
};

const StudentsTable = ({ items, onEdit, onDelete, error, hasSearchQuery }) => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Students List</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <img className="h-10 w-10 rounded-full object-cover" src={item.photo || 'https://via.placeholder.com/150'} alt={item.student_name} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.student_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nis}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.student_class?.class_name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.gender === 'L' ? 'Male' : 'Female'}</td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : !error && (
                       <tr><td colSpan={isAuthenticated ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                           {hasSearchQuery ? 'No students match your search.' : 'No students found.'}
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingStudentsTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 dark:text-gray-600 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody></table>
        </div>
    );
};

// --- Main Page Component ---

export default function StudentsPage() {
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { authHeader, isAuthenticated } = useAuth();
    const apiService = getApiService(authHeader);

    const fetchData = useCallback(async (url = `${API_URL}?search=${searchQuery}`) => {
        setIsDataLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            setItems(data.results);
            setCount(data.count);
            setNextPage(data.next);
            setPreviousPage(data.previous);
        } catch (err) {
            setError('Could not load students. Please try again later.');
        } finally {
            setIsDataLoading(false);
        }
    }, [searchQuery]); // apiService is stable

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(`${API_URL}?search=${searchQuery}`);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, formData);
            } else {
                await apiService.post(formData);
            }
            closeModal();
            fetchData();
        } catch (err) {
            console.error("Failed to save student:", err);
            alert(`Failed to save student. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
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
        if (window.confirm('Are you sure you want to delete this student?')) {
             try {
                await apiService.delete(id);
                fetchData();
            } catch (err) {
                 setError(`Delete failed: ${err.message}.`);
            }
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePageChange = (url) => {
        if (url) fetchData(url);
    };

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">Student Management</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-white">Manage student information.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        Add New Student
                    </button>
                )}
            </header>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name or NIS..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <main>
                {isDataLoading ? (
                    <LoadingStudentsTable />
                ) : (
                    <>
                        <StudentsTable
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            error={error}
                            hasSearchQuery={!!searchQuery}
                        />
                        {count > 0 && (
                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    Total <span className="font-medium">{count}</span> results
                                </span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit Student' : 'Add New Student'}>
                <StudentForm 
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}