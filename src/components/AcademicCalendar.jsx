import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

// --- Helper Functions & Initial State ---
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/academic-calendars/`;

const initialState = {
    event_name: '',
    event_start_date: '',
    event_end_date: '',
    description: '',
    category: '',
    type: 'Putra',
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// --- API Service ---
const getApiService = (authHeader) => ({
    get: async (url = API_URL) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
        return response.json();
    },
    put: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data),
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
             throw new Error('Failed to delete item');
        }
        return response;
    },
});

// --- UI Components ---

const AcademicCalendarForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                ...currentItem,
                event_start_date: formatDateForInput(currentItem.event_start_date),
                event_end_date: formatDateForInput(currentItem.event_end_date),
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
            <div>
                <label htmlFor="event_name" className="block text-sm font-medium text-gray-700">Event Name</label>
                <input type="text" name="event_name" id="event_name" value={formData.event_name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="event_start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" name="event_start_date" id="event_start_date" value={formData.event_start_date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="event_end_date" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                    <input type="date" name="event_end_date" id="event_end_date" value={formData.event_end_date || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" disabled={isSubmitting} />
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" disabled={isSubmitting}></textarea>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input type="text" name="category" id="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 rounded-md" disabled={isSubmitting}>
                        <option>Putra</option>
                        <option>Putri</option>
                    </select>
                </div>
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

const AcademicCalendarTable = ({ items, onEdit, onDelete, error }) => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="text-2xl font-bold mb-4 text-gray-800">Academic Calendar Events</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                           {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items && items.length > 0 ? items.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.event_name}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.event_start_date} {item.event_end_date && `to ${item.event_end_date}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'Putra' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>{item.type}</span></td>
                                {isAuthenticated && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                )}
                            </tr>
                        )) : (
                           <tr><td colSpan={isAuthenticated ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">No events found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main App Page Component ---

export default function AcademicCalendarPage() {
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tableError, setTableError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { authHeader, isAuthenticated } = useAuth();
    const apiService = getApiService(authHeader);

    const fetchData = useCallback(async (url = API_URL) => {
        setIsDataLoading(true);
        setTableError(null);
        try {
            const data = await apiService.get(url);
            setItems(data.results || []);
            setCount(data.count);
            setNextPage(data.next);
            setPreviousPage(data.previous);
        } catch (err) {
            setTableError('Could not load calendar data. Please try again later.');
        } finally {
            setIsDataLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (itemData) => {
        setIsSubmitting(true);
        const dataToSave = { ...itemData };
        if (!dataToSave.event_end_date) {
            dataToSave.event_end_date = null;
        }

        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, dataToSave);
            } else {
                await apiService.post(dataToSave);
            }
            closeModal();
            fetchData();
        } catch (err) {
            // Error handling can be enhanced here, e.g., showing a notification
            console.error("Failed to save item:", err);
            alert(`Failed to save event. Access may be forbidden. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNew = () => {
        setCurrentItem(initialState);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
             try {
                await apiService.delete(id);
                fetchData();
            } catch (err) {
                 setTableError(`Delete failed: ${err.message}. Forbidden action.`);
            }
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    }

    const handlePageChange = (url) => {
        if (url) fetchData(url);
    };

    return (
        <>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Academic Calendar</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage school events and holidays.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Add New Event
                    </button>
                )}
            </header>

            <main>
                {isDataLoading ? (
                    <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>
                ) : (
                        <>
                            <AcademicCalendarTable
                                items={items}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                error={tableError}
                            />
                            {count > 10 && ( // Assuming page_size is 10
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-700">
                                        Total <span className="font-medium">{count}</span> events
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit Event' : 'Add New Event'}>
                <AcademicCalendarForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}