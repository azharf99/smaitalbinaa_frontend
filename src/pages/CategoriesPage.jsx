import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/categories/`;

const initialState = {
    name: '',
    description: '',
};

const getApiService = (authHeader) => ({
    get: async (url = API_URL) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    put: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() },
        });
        if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete category');
        }
        return response;
    },
});

const CategoryForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        setFormData(currentItem ? currentItem : initialState);
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
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting}></textarea>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                </button>
            </div>
        </form>
    );
};

const LoadingCategoriesTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 3 : 2;
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 dark:text-gray-600 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody>
            </table>
        </div>
    );
};

export default function CategoriesPage() {
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { authHeader, isAuthenticated } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.get();
            setItems(data.results || data); // Handle paginated and non-paginated responses
        } catch (err) {
            setError('Could not load categories. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, formData);
            } else {
                await apiService.post(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert(`Failed to save category. Error: ${err.message}`);
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
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await apiService.delete(id);
                fetchData();
            } catch (err) {
                setError(`Delete failed: ${err.message}.`);
            }
        }
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Blog Categories</h1>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Add New Category
                    </button>
                )}
            </header>

            <main>
                {isLoading ? <LoadingCategoriesTable /> : error ? <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div> : (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                    {isAuthenticated && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.description}</td>
                                        {isAuthenticated && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem ? 'Edit Category' : 'Add New Category'}>
                <CategoryForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}