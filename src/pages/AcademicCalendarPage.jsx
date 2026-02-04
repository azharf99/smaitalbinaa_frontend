import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
// import '@fullcalendar/common/main.css';
// import '@fullcalendar/daygrid/main.css';

// --- Helper Functions & Initial State ---
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/academic-calendars/`;

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
        const response = await fetch(url, {headers: { ...authHeader() }});
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
             throw new Error('Failed to delete item');
        }
        return response;
    },
});

// --- UI Components ---

const AcademicCalendarForm = ({ currentItem, onSave, onCancel, isSubmitting, onDelete }) => {
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
            <div className="flex justify-between items-center pt-4">
                <div>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => onDelete(currentItem.id)}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                            disabled={isSubmitting}
                        >
                            Delete
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
                        {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                    </button>
                </div>
            </div>
        </form>
    );
};

// --- Main App Page Component ---

export default function AcademicCalendarPage() {
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { authHeader, isAuthenticated } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchAllData = useCallback(async () => {
        setIsDataLoading(true);
        setError(null);
        let allItems = [];
        let url = API_URL;
        try {
            while (url) {
                const data = await apiService.get(url);
                allItems = allItems.concat(data.results || []);
                url = data.next;
            }
            setItems(allItems);
        } catch (err) {
            setError('Could not load calendar data. Please try again later.');
        } finally {
            setIsDataLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

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
            fetchAllData();
        } catch (err) {
            // Error handling can be enhanced here, e.g., showing a notification
            console.error("Failed to save item:", err);
            alert(`Failed to save event. Access may be forbidden. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNew = () => {
        setCurrentItem({ ...initialState });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
             try {
                closeModal(); // Close modal before deleting
                await apiService.delete(id);
                fetchAllData();
            } catch (err) {
                 setError(`Delete failed: ${err.message}. Forbidden action.`);
            }
        }
    };
    
    const handleDateClick = (arg) => {
        setCurrentItem({
            ...initialState,
            event_start_date: arg.dateStr,
        });
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        handleEdit(clickInfo.event.extendedProps);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    }

    const calendarEvents = items.map(item => {
        let endDate = item.event_end_date;
        if (endDate) {
            const date = new Date(endDate);
            date.setDate(date.getDate() + 1);
            endDate = date.toISOString().split('T')[0];
        }
        return {
            id: item.id,
            title: item.event_name,
            start: item.event_start_date,
            end: endDate,
            allDay: true,
            extendedProps: item,
            className: `cursor-pointer border-l-4 ${item.type === 'Putra' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-pink-50 border-pink-500 text-pink-800'}`,
        };
    });

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">Academic Calendar</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-white">Manage school events and holidays.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        Add New Event 
                    </button>
                )}
            </header>

            <main>
                {isDataLoading ? (
                    <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>
                ) : (
                    <div className="bg-white text-black p-6 rounded-lg shadow-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,dayGridWeek,dayGridDay'
                            }}
                            events={calendarEvents}
                            editable={false}
                            selectable={true}
                            dateClick={isAuthenticated ? handleDateClick : undefined}
                            eventClick={isAuthenticated ? handleEventClick : undefined}
                            height="auto"
                        />
                    </div>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit Event' : 'Add New Event'}>
                <AcademicCalendarForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    onDelete={handleDelete}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}