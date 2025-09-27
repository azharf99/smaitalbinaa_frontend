import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import CommentSection from '../components/CommentSection.jsx';
import Modal from '../common/Modal.jsx';
import { PostForm } from './NewsPage.jsx'; // Assuming PostForm is exported

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/posts/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch post');
        return response.json();
    },
    put: async (id, formData) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData,
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
        if (!response.ok && response.status !== 204) throw new Error('Failed to delete post');
    },
});

export default function PostDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, authHeader, isAuthLoading } = useAuth();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchPost = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.get(`${API_URL}?slug=${slug}`);
            if (data.results && data.results.length > 0) {
                setPost(data.results[0]);
            } else {
                setError('Post not found.');
            }
        } catch (err) {
            setError('Failed to load the post.');
        } finally {
            setIsLoading(false);
        }
    }, [slug, apiService]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const handleDelete = async () => {
        if (post && window.confirm('Are you sure you want to delete this post?')) {
            try {
                await apiService.delete(post.id);
                navigate('/news');
            } catch (err) {
                alert(`Delete failed: ${err.message}`);
            }
        }
    };

    const handleEdit = () => setIsEditModalOpen(true);
    
    const handleSave = async (formData) => {
        if (post) {
            setIsSubmitting(true);
            try {
                // If the file input is empty, don't send the featured_image field
                if (formData.get('featured_image') && formData.get('featured_image').size === 0) {
                    formData.delete('featured_image');
                }
                await apiService.put(post.id, formData);
                setIsEditModalOpen(false);
                fetchPost(); // Refetch post to show updated data
            } catch (err) {
                alert(`Failed to update post. Error: ${err.message}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (isLoading || isAuthLoading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="error-alert">{error}</div>;
    }

    if (!post) {
        return <div className="text-center py-10">Post not found.</div>;
    }

    const canModify = user && (user.user_id === post.author.user || user.is_superuser);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
            <article>
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{post.title}</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        By {post.author.teacher_name} on {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    {canModify && (
                        <div className="mt-4 space-x-2">
                            <button onClick={handleEdit} className="btn-secondary">Edit</button>
                            <button onClick={handleDelete} className="btn-danger">Delete</button>
                        </div>
                    )}
                </header>
                {post.featured_image && <img src={post.featured_image} alt={post.title} className="w-full h-auto max-h-96 object-cover rounded-lg mb-8" />}
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            <hr className="my-12" />

            <CommentSection postId={post.id} />

            {canModify && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Post">
                    <PostForm currentItem={post} onSave={handleSave} onCancel={() => setIsEditModalOpen(false)} isSubmitting={isSubmitting} />
                </Modal>
            )}
        </div>
    );
}