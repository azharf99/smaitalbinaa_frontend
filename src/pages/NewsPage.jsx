import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonCard } from '../common/Skeleton.jsx';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/posts/`;
const CATEGORIES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/categories/`;
const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;

const initialState = {
    title: '',
    slug: '',
    content: '',
    category: [],
    author: 1,
    tags: '',
    status: 'draft',
    featured_image: null,
};

const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/--+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, {headers: { ...authHeader() }});
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },
    post: async (formData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
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
    patch: async (id, formData) => {
        const response = await fetch(`${API_URL}${id}/`, {
            method: 'PATCH',
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
        return response;
    },
});

export const PostForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [categories, setCategories] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const { authHeader } = useAuth();
    const [photoPreview, setPhotoPreview] = useState(null);
    

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

        const fetchTeachers = async () => {
            try {
                // Fetch all pages of active teachers
                let allTeachers = [];
                let url = `${TEACHERS_API_URL}?status=Aktif`;
                while (url) {
                    const response = await fetch(url);
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

        // Cleanup function to revoke blob URL on component unmount or when currentItem changes
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, []);

    useEffect(() => {
        if (currentItem) {
            const { featured_image, ...rest } = currentItem;
            setFormData({
                ...initialState,
                ...rest,
                author_id: currentItem.author?.id || '',
                category_ids: (currentItem.category || []).map(c => c.id),
                tags: (currentItem.tags || []).join(', '),
            });
            setPhotoPreview(currentItem.featured_image); // Show existing photo
        } else {
            setFormData(initialState);
            setPhotoPreview(null);
        }
    }, [currentItem]);


    const handleChange = (e) => {
        const { name, value, type, files, selectedOptions } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({ ...prev, featured_image: file }));
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview); // Revoke old blob URL
            }
            setPhotoPreview(URL.createObjectURL(file)); // Create and set new blob URL
        } else if (type === 'select-multiple') {
            const values = Array.from(selectedOptions, option => option.value);
            setFormData(prev => ({ ...prev, [name]: values }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (name === 'title') {
                setFormData(prev => ({ ...prev, slug: slugify(value) }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') return;
            if (key === 'category_ids') {
                value.forEach(id => data.append('category_ids', id));
            } else if (key === 'featured_image' && value instanceof File) {
                data.append('featured_image', value);
            } else {
                data.append(key, value);
            }
        });

        onSave(data);
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content: content }));
    };

    const isEditing = !!(currentItem && currentItem.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-white">Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Post Title" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
            </div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-white">Author</label>
            <select id="author_id" name="author_id" value={formData.author_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="" className='bg-gray-500'>Select an author</option>
                {teachers.map(teacher => ( <option key={teacher.id} value={teacher.id} className='bg-gray-500'> {teacher.teacher_name} </option> ))}
            </select>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-900 dark:text-white">Content</label>
                <CKEditor
                    editor={ClassicEditor}
                    data={formData.content}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        handleEditorChange(data);
                    }}
                    config={{
                        simpleUpload: {
                            uploadUrl: `${import.meta.env.VITE_API_BASE_URL}/upload/`,
                            headers: {
                                ...authHeader()
                            }
                        }
                    }}
                />
            </div>
            <label htmlFor="category_ids" className="block text-sm font-medium text-gray-700 dark:text-white">Kategori</label>
            <select id="category_ids" name="category_ids" multiple value={formData.category_ids} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-white">Tags</label>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., science, event, announcement" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-white">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>
            <div>
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image</label>
                {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-32 h-32 rounded-md object-cover" />}
                <input type="file" id="featured_image" name="featured_image" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {isEditing && currentItem.photo && <p className="text-xs text-gray-500 mt-1">Current photo will be replaced if you upload a new one.</p>}
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
                <img className="w-full h-56 object-cover object-center" src={post.featured_image || 'https://placehold.co/400x300?text=No+Image'} alt={post.title} />
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
                        <button onClick={() => onEdit(post)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium cursor-pointer">Edit</button>
                        <button onClick={() => onDelete(post.id)} className="text-sm text-red-600 hover:text-red-900 font-medium cursor-pointer">Delete</button>
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
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

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
        const baseUrl = API_URL;
        const urlWithFilter = selectedCategory ? `${baseUrl}?category=${selectedCategory}` : baseUrl;
        setPosts([]);
        fetchData(urlWithFilter, true);
    }, [fetchData, selectedCategory]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(CATEGORIES_API_URL);
                const data = await response.json();
                setCategoryOptions(data.results || data || []);
            } catch (e) {
                // silently ignore category loading errors for filter UI
            }
        };
        fetchCategories();
    }, []);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.patch(currentItem.id, formData);
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

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">School News & Blog</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Latest updates and stories from our school.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto items-center">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">All categories</option>
                        {categoryOptions.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {isAuthenticated && (
                        <button onClick={handleAddNew} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Add New Post
                        </button>
                    )}
                </div>
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
                                <button onClick={() => fetchData(nextPageUrl, false)} disabled={isMoreLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed">
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