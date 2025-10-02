import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/notifications/`;

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
    markAsRead: async (id) => {
        const response = await fetch(`${API_URL}${id}/mark-read/`, {
            method: 'PATCH',
            headers: { ...authHeader() },
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return response.json();
    },
    markAllAsRead: async () => {
        const response = await fetch(`${API_URL}mark-all-read/`, {
            method: 'PATCH',
            headers: { ...authHeader() },
        });
        if (!response.ok) throw new Error('Failed to mark all notifications as read');
        return response.json();
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

export const useNotifications = () => {
    const { authHeader, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchNotifications = useCallback(async (url = API_URL) => {
        if (!user) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            const newNotifications = data.results || [];
            setNotifications(prev => url === API_URL ? newNotifications : [...prev, ...newNotifications]);
            
            // Count unread notifications
            const unread = newNotifications.filter(n => !n.is_read).length;
            setUnreadCount(prev => url === API_URL ? unread : prev + unread);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [apiService, user]);

    const createNotification = useCallback(async (formData) => {
        try {
            const newNotification = await apiService.post(formData);
            setNotifications(prev => [newNotification, ...prev]);
            return newNotification;
        } catch (err) {
            throw new Error(err.message);
        }
    }, [apiService]);

    const updateNotification = useCallback(async (id, formData) => {
        try {
            const updatedNotification = await apiService.patch(id, formData);
            setNotifications(prev => 
                prev.map(n => n.id === id ? updatedNotification : n)
            );
            return updatedNotification;
        } catch (err) {
            throw new Error(err.message);
        }
    }, [apiService]);

    const deleteNotification = useCallback(async (id) => {
        try {
            await apiService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Recalculate unread count
            setUnreadCount(prev => {
                const deletedNotification = notifications.find(n => n.id === id);
                return deletedNotification && !deletedNotification.is_read ? prev - 1 : prev;
            });
        } catch (err) {
            throw new Error(err.message);
        }
    }, [apiService, notifications]);

    const markAsRead = useCallback(async (id) => {
        try {
            await apiService.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            throw new Error(err.message);
        }
    }, [apiService]);

    const markAllAsRead = useCallback(async () => {
        try {
            await apiService.markAllAsRead();
            setNotifications(prev => 
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            throw new Error(err.message);
        }
    }, [apiService]);

    const batchCreateNotification = useCallback(async (data) => {
        try {
            const newNotifications = await apiService.batchCreate(data);
            // Refresh notifications to show the new batch
            await fetchNotifications();
            return newNotifications;
        } catch (err) {
            throw new Error(err.message);
        }
    }, [apiService, fetchNotifications]);

    // Fetch notifications on mount and when user changes
    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [fetchNotifications, user]);

    return {
        notifications,
        isLoading,
        error,
        unreadCount,
        fetchNotifications,
        createNotification,
        updateNotification,
        deleteNotification,
        markAsRead,
        markAllAsRead,
        batchCreateNotification,
    };
};
