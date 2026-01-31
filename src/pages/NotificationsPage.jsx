import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonCard } from '../common/Skeleton.jsx';
import DeleteConfirmation from '../common/DeleteConfirmation.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/notifications/`;
const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, {
            headers: { ...authHeader() }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },
    post: async (data) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                ...authHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                throw new Error(JSON.stringify(await response.json()));
            }
            throw new Error(`Server error: ${response.status} ${await response.text()}`);
        }
        return response.json();
    },
    put: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { 
                ...authHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                throw new Error(JSON.stringify(await response.json()));
            }
            throw new Error(`Server error: ${response.status} ${await response.text()}`);
        }
        return response.json();
    },
    patch: async (id, data) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PATCH',
            headers: { 
                ...authHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                throw new Error(JSON.stringify(await response.json()));
            }
            throw new Error(`Server error: ${response.status} ${await response.text()}`);
        }
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() },
        });
        if (!response.ok && response.status !== 204) throw new Error('Failed to delete notification');
        return response;
    },
    batchCreate: async (data) => {
        const response = await fetch(`${API_URL}batch-create/`, {
            method: 'POST',
            headers: { 
                ...authHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                throw new Error(JSON.stringify(await response.json()));
            }
            throw new Error(`Server error: ${response.status} ${await response.text()}`);
        }
        return response.json();
    },
});

const NotificationForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        teacher: '',
        sendToAll: false
    });
    const [teachers, setTeachers] = useState([]);
    const { authHeader } = useAuth();

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                let allTeachers = [];
                let url = `${TEACHERS_API_URL}?status=Aktif`;
                while (url) {
                    const response = await fetch(url, {
                        headers: { ...authHeader() }
                    });
                    const data = await response.json();
                    allTeachers = allTeachers.concat(data.results || []);
                    url = data.next;
                }
                setTeachers(allTeachers);
            } catch (error) {
                console.error("Error fetching teachers:", error);
            }
        };
        fetchTeachers();
    }, [authHeader]);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                title: currentItem.title || '',
                message: currentItem.message || '',
                type: currentItem.type || 'info',
                teacher: currentItem.teacher?.id || '',
                sendToAll: false
            });
        } else {
            setFormData({
                title: '',
                message: '',
                type: 'info',
                teacher: '',
                sendToAll: false
            });
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const isEditing = !!(currentItem && currentItem.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-white">Title</label>
                <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="Notification title" 
                    required 
                    maxLength={100}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
                />
            </div>
            
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-white">Message</label>
                <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder="Notification message" 
                    required 
                    maxLength={1000}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
                />
            </div>

            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-white">Type</label>
                <select 
                    id="type" 
                    name="type" 
                    value={formData.type.toLowerCase()} 
                    onChange={handleChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                </select>
            </div>

            <div>
                <div className="flex items-center mb-2">
                    <input
                        type="checkbox"
                        id="sendToAll"
                        name="sendToAll"
                        checked={formData.sendToAll}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendToAll" className="ml-2 block text-sm font-medium text-gray-700 dark:text-white">
                        Send to All Teachers
                    </label>
                </div>
                
                {!formData.sendToAll && (
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-white">Teacher</label>
                        <select 
                            id="teacher" 
                            name="teacher" 
                            value={formData.teacher} 
                            onChange={handleChange} 
                            required={!formData.sendToAll}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select a teacher</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.teacher_name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={isSubmitting} 
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? <LoadingSpinner /> : (
                        isEditing ? 'Update Notification' : 
                        formData.sendToAll ? 'Send to All Teachers' : 'Create Notification'
                    )}
                </button>
            </div>
        </form>
    );
};

const NotificationCard = ({ notification, onEdit, onDelete, canModify }) => {
    const getTypeColor = (type) => {
        const colors = {
            debug: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return colors[type] || colors.info;
    };

    const canPerformActions = canModify && (onEdit || onDelete);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                        {notification.type}
                    </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{notification.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>By: {notification.teacher?.teacher_name || 'Unknown'}</span>
                    <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                </div>
                {canPerformActions && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                        <button 
                            onClick={() => onEdit(notification)} 
                            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium cursor-pointer"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => onDelete(notification.id)} 
                            className="text-sm text-red-600 hover:text-red-900 font-medium cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(API_URL);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);

    const { user, authHeader, isAuthenticated } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchData = useCallback(async (url, isInitial = true) => {
        if (!url) return;
        isInitial ? setIsInitialLoading(true) : setIsMoreLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            const newNotifications = data.results || [];
            setNotifications(prev => isInitial ? newNotifications : [...prev, ...newNotifications]);
            setNextPageUrl(data.next || null);
        } catch (err) {
            setError('Could not load notifications. Please try again later.');
        } finally {
            isInitial ? setIsInitialLoading(false) : setIsMoreLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchData(API_URL, true);
    }, [fetchData]);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                // Edit existing notification
                const data = {
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                    teacher_id: formData.teacher
                };
                await apiService.patch(currentItem.id, data);
            } else if (formData.sendToAll) {
                // Create batch notifications for all teachers
                const data = {
                    title: formData.title,
                    message: formData.message,
                    type: formData.type
                };
                await apiService.batchCreate(data);
            } else {
                // Create single notification
                const data = {
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                    teacher_id: formData.teacher
                };
                await apiService.post(data);
            }
            setIsModalOpen(false);
            fetchData(API_URL, true);
        } catch (err) {
            alert(`Failed to save notification. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (notification) => {
        setCurrentItem(notification);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        setDeleteItemId(id);
    };

    const confirmDelete = async () => {
        if (deleteItemId) {
            try {
                await apiService.delete(deleteItemId);
                fetchData(API_URL, true);
            } catch (err) {
                alert(`Delete failed: ${err.message}`);
            } finally {
                setDeleteItemId(null);
            }
        }
    };

    if (!user?.is_superuser) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
            </div>
        );
    }

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Notifications Management</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Create and manage notifications for all users. Use "Send to All Teachers" for batch notifications.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleAddNew} 
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add New Notification
                    </button>
                </div>
            </header>

            <main>
                {isInitialLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <NotificationCard 
                                        key={notification.id} 
                                        notification={notification} 
                                        onEdit={handleEdit} 
                                        onDelete={handleDelete} 
                                        canModify={true}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-8">No notifications found.</div>
                            )}
                        </div>
                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button 
                                    onClick={() => fetchData(nextPageUrl, false)} 
                                    disabled={isMoreLoading} 
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isMoreLoading ? <LoadingSpinner /> : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={currentItem ? 'Edit Notification' : 'Add New Notification'}
            >
                <NotificationForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            <DeleteConfirmation
                isOpen={!!deleteItemId}
                onClose={() => setDeleteItemId(null)}
                onConfirm={confirmDelete}
                title="Delete Notification"
                message="Are you sure you want to delete this notification? This action cannot be undone."
            />
        </>
    );
}
