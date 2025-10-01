import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import { Navigate } from 'react-router-dom';

// --- Helper Functions & Initial State ---
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/`;

const initialState = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_superuser: false,
};

// --- API Service ---
const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, { headers: { ...authHeader() } });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(`Server error: ${response.status} ${await response.text()}`);
        }
        return response.json();
    },
    put: async (id, data) => {
        // Don't send empty password
        if (data.password === '') {
            delete data.password;
        }
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(`Server error: ${response.status} ${await response.text()}`);
        }
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() }
        });
        if (!response.ok && response.status !== 204) {
             throw new Error('Failed to delete user');
        }
        return response;
    },
});

// --- UI Components ---

const UserForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (currentItem) {
            setFormData({ ...initialState, ...currentItem, password: '' }); // Clear password on edit
        } else {
            setFormData(initialState);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 border px-2 rounded-sm" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 border px-2 rounded-sm" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 border px-2 rounded-sm" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 border px-2 rounded-sm" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">{isEditing ? 'New Password' : 'Password'}</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 border px-2 rounded-sm" placeholder={isEditing ? 'Leave blank to keep current' : ''} disabled={isSubmitting} />
                </div>
                <div className="flex items-center pt-6">
                    <input type="checkbox" id="is_superuser" name="is_superuser" checked={formData.is_superuser} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" disabled={isSubmitting} />
                    <label htmlFor="is_superuser" className="ml-2 block text-sm text-gray-900">Superuser status</label>
                </div>
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

const UsersTable = ({ items, onEdit, onDelete, error, hasSearchQuery }) => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Users List</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.is_superuser ? 'Superuser' : 'User'}</td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : (
                       <tr><td colSpan={isAuthenticated ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                           {hasSearchQuery ? 'No users match your search.' : 'No users found.'}
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingUsersTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 5 : 4;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 dark:text-gray-600 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody>
            </table>
        </div>
    );
};
// --- Main Page Component ---

export default function UsersPage() {
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

    const { user, authHeader, isAuthenticated } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

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
            setError('Could not load users. Please try again later.');
        } finally {
            setIsDataLoading(false);
        }
    }, [searchQuery, apiService]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (user?.is_superuser) {
                fetchData();
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, fetchData, user]);

    if (!user?.is_superuser) {
        return <Navigate to="/" replace />;
    }

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
            console.error("Failed to save user:", err);
            alert(`Failed to save user. Error: ${err.message}`);
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
        if (window.confirm('Are you sure you want to delete this user?')) {
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
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">User Management</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-white">Manage system users and permissions.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        Add New User
                    </button>
                )}
            </header>

            <div className="mb-4 flex justify-between items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by username or name..."
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
                    <LoadingUsersTable />
                ) : (
                    <>
                        <UsersTable
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            error={error}
                            hasSearchQuery={!!searchQuery}
                        />
                        {count > 0 && (
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-700">
                                    Total <span className="font-medium">{count}</span> results
                                </span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit User' : 'Add New User'}>
                <UserForm 
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}