import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/comments/`;

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch comments');
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
});

export default function CommentSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, authHeader, isAuthenticated } = useAuth();

    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.get(`${API_URL}?post=${postId}`);
            setComments(data.results || data);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [postId, apiService]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await apiService.post({
                post: postId,
                body: newComment,
                // author is set by the backend based on the authenticated user
            });
            setNewComment('');
            fetchComments(); // Refetch comments to show the new one
        } catch (error) {
            alert(`Failed to post comment: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section aria-labelledby="comments-title">
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg sm:overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="px-4 py-5 sm:px-6">
                        <h2 id="comments-title" className="text-lg font-medium text-gray-900 dark:text-white">Comments</h2>
                    </div>
                    <div className="px-4 py-6 sm:px-6">
                        {isLoading ? <LoadingSpinner /> : (
                            <ul className="space-y-8">
                                {comments.map((comment) => (
                                    <li key={comment.id}>
                                        <div className="flex space-x-3">
                                            <div className="flex-shrink-0">
                                                {/* Placeholder for author image */}
                                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-bold text-white">
                                                    {comment.author_name.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm">
                                                    <a href="#" className="font-medium text-gray-900 dark:text-white">{comment.author_name}</a>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                                    <p>{comment.body}</p>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleString()}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                {isAuthenticated && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-6 sm:px-6">
                        <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-400"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <form onSubmit={handleCommentSubmit}>
                                    <div>
                                        <label htmlFor="comment" className="sr-only">Add a comment</label>
                                        <textarea id="comment" name="comment" rows="3" className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required></textarea>
                                    </div>
                                    <div className="mt-3 flex items-center justify-end">
                                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                                            {isSubmitting ? <LoadingSpinner /> : 'Post Comment'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}