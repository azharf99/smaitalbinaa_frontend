import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/targets/`;

const initialState = {
    tanggal: new Date().toISOString().split('T')[0],
    target_juz: '',
    target_halaman: '',
    target_baris: '',
};

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, { headers: { ...authHeader() } });
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
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
        if (response.status !== 204) throw new Error('Failed to delete');
    },
});

const TargetForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                ...initialState,
                ...currentItem,
                tanggal: currentItem.tanggal ? new Date(currentItem.tanggal).toISOString().split('T')[0] : '',
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
                    <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal</label>
                    <input type="date" name="tanggal" id="tanggal" value={formData.tanggal} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="target_juz" className="block text-sm font-medium text-gray-700">Target Juz</label>
                    <input type="number" name="target_juz" id="target_juz" value={formData.target_juz} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="target_halaman" className="block text-sm font-medium text-gray-700">Target Halaman</label>
                    <input type="number" name="target_halaman" id="target_halaman" value={formData.target_halaman} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="target_baris" className="block text-sm font-medium text-gray-700">Target Baris</label>
                    <input type="number" name="target_baris" id="target_baris" value={formData.target_baris} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
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

const TargetsTable = ({ items, onEdit, onDelete, error }) => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tilawah Targets</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Juz</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Halaman</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Baris</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.tanggal).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.target_juz}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.target_halaman}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.target_baris}</td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : (
                       <tr><td colSpan={isAuthenticated ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">No targets found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 5 : 4;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 bg-gray-300 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody></table>
        </div>
    );
};

export default function TargetTilawahPage() {
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { authHeader, isAuthenticated } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchData = useCallback(async (url = API_URL) => {
        setIsDataLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            setItems(data.results || []);
            setCount(data.count || 0);
            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
        } catch (err) {
            setError('Could not load targets. Please try again later.');
        } finally {
            setIsDataLoading(false);
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
            closeModal();
            fetchData();
        } catch (err) {
            alert(`Failed to save target. Error: ${err.message}`);
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
        if (window.confirm('Are you sure you want to delete this target?')) {
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

    const handlePageChange = (url) => { if (url) fetchData(url); };

    return (
        <>
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Target Tilawah Management</h1>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="btn-primary">
                        Add New Target
                    </button>
                )}
            </header>

            <main>
                {isDataLoading ? <LoadingTable /> : (
                    <>
                        <TargetsTable items={items} onEdit={handleEdit} onDelete={handleDelete} error={error} />
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Target' : 'Add New Target'}>
                <TargetForm currentItem={currentItem} onSave={handleSave} onCancel={closeModal} isSubmitting={isSubmitting} />
            </Modal>
        </>
    );
}