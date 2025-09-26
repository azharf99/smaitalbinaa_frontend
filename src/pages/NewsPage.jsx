import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonCard } from '../common/Skeleton.jsx';
import { Editor } from '@tinymce/tinymce-react';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/posts/`;
const CATEGORIES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/categories/`;

const initialState = {
    title: '',
    content: '',
    category: [],
    tags: '',
    status: 'draft',
    featured_image: null,
};

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },
    post: async (formData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { ...authHeader() },
            body: formData,
        });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    put: async (id, formData) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData,
        });
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        return response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { ...authHeader() },
        });
        if (!response.ok && response.status !== 204) throw new Error('Failed to delete post');
        return response;
    },
});

export const PostForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(CATEGORIES_API_URL);
                const data = await response.json();
                setCategories(data.results || data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (currentItem) {
            const { featured_image, ...rest } = currentItem;
            setFormData({
                ...initialState,
                ...rest,
                category: currentItem.category.map(c => c.id),
                tags: currentItem.tags.map(t => t.name).join(', '),
            });
        } else {
            setFormData(initialState);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, type, files, selectedOptions } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === 'select-multiple') {
            const values = Array.from(selectedOptions, option => option.value);
            setFormData(prev => ({ ...prev, [name]: values }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'category') {
                formData.category.forEach(catId => data.append('category', catId));
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });
        onSave(data);
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content: content }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Post Title" required className="mt-1 block w-full input-style text-gray-900" />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    value={formData.content}
                    onEditorChange={handleEditorChange}
                    init={{
                        height: 400,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                    }}
                />
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories</label>
                <select id="category" name="category" multiple value={formData.category} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple categories.</p>
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., science, event, announcement" className="mt-1 block w-full input-style text-gray-900" />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>
            <div>
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image</label>
                <input type="file" id="featured_image" name="featured_image" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                    {isSubmitting ? <LoadingSpinner /> : (currentItem && currentItem.id ? 'Update Post' : 'Save Post')}
                </button>
            </div>
        </form>
    );
};

const PostCard = ({ post, onEdit, onDelete, canModify }) => {
    const canPerformActions = canModify && (onEdit || onDelete);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
            <Link to={`/news/${post.slug}`} className="block hover:opacity-90 transition-opacity">
                <img className="w-full h-56 object-cover object-center" src={post.featured_image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={post.title} />
            </Link>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">by {post.author.teacher_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                    </p>
                </div>
                {canPerformActions && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                        <button onClick={() => onEdit(post)} className="btn-secondary text-sm">Edit</button>
                        <button onClick={() => onDelete(post.id)} className="btn-danger text-sm">Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function NewsPage() {
    const [posts, setPosts] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(API_URL);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, authHeader, isAuthenticated } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    const fetchData = useCallback(async (url, isInitial = true) => {
        if (!url) return;
        isInitial ? setIsInitialLoading(true) : setIsMoreLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            const newPosts = data.results || [];
            setPosts(prev => isInitial ? newPosts : [...prev, ...newPosts]);
            setNextPageUrl(data.next || null);
        } catch (err) {
            setError('Could not load posts. Please try again later.');
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
                await apiService.put(currentItem.id, formData);
            } else {
                await apiService.post(formData);
            }
            setIsModalOpen(false);
            fetchData(API_URL, true); // Refetch all
        } catch (err) {
            alert(`Failed to save post. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (post) => {
        setCurrentItem(post);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await apiService.delete(id);
                // Refetch posts from the beginning to ensure data consistency
                fetchData(API_URL, true);
            } catch (err) {
                alert(`Delete failed: ${err.message}`);
                // Optionally set an error state to display in the UI
                setError(`Delete failed: ${err.message}.`);
            }
        }
    };

    console.log(isAuthenticated)

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">School News & Blog</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Latest updates and stories from our school.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add New Post
                    </button>
                )}
            </header>

            <main>
                {isInitialLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.length > 0 ? (
                                posts.map(post => {
                                    const canModify = user && (user.user_id === post.author.user || user.is_superuser);
                                    return <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        onEdit={handleEdit} 
                                        onDelete={handleDelete} 
                                        canModify={canModify} />
                                })
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-8">No posts found.</div>
                            )}
                        </div>
                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button onClick={() => fetchData(nextPageUrl, false)} disabled={isMoreLoading} className="btn-primary">
                                    {isMoreLoading ? <LoadingSpinner /> : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem ? 'Edit Post' : 'Add New Post'}>
                <PostForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}