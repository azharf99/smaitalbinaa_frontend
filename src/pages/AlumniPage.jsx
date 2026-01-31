import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/alumni/`;
const PAGE_SIZE = 20; // Adjust page size as needed

const initialState = {
    name: '',
    nis: '',
    nisn: '',
    group: '',
    graduate_year: '',
    gender: 'L',
    birth_place: '',
    birth_date: '',
    phone: '',
    job: '',
    company_name: '',
    undergraduate_university: '',
    photo: null,
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

// --- UI Components ---

const LoadingAlumniTable = () => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 dark:text-gray-600 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {Array.from({ length: 7 }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={7} />)}
                </tbody>
            </table>
        </div>
    );
};

const AlumniForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (currentItem) {
            const { photo, ...rest } = currentItem;
            setFormData({
                ...initialState,
                ...rest,
                birth_date: formatDateForInput(currentItem.birth_date),
            });
            setPhotoPreview(currentItem.photo); // Show existing photo
        } else {
            setFormData(initialState);
            setPhotoPreview(null); // Clear preview for new item
        }

        // Cleanup function to revoke blob URL on component unmount or when currentItem changes
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo' && files && files[0]) {
            const file = files[0];
            setFormData(prev => ({ ...prev, photo: file }));
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview); // Revoke old blob URL
            }
            setPhotoPreview(URL.createObjectURL(file)); // Create and set new blob URL
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        }
        onSave(data);
    };

    const isEditing = !!(currentItem && currentItem.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="group" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Angkatan</label>
                    <input type="text" id="group" name="group" value={formData.group || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="nis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">NIS</label>
                    <input type="text" id="nis" name="nis" value={formData.nis || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">NISN</label>
                    <input type="text" id="nisn" name="nisn" value={formData.nisn || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="graduate_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tahun Lulus</label>
                    <input type="text" id="graduate_year" name="graduate_year" value={formData.graduate_year || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
                    <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white">
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="birth_place" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tempat Lahir</label>
                    <input type="text" id="birth_place" name="birth_place" value={formData.birth_place || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Lahir</label>
                    <input type="date" id="birth_date" name="birth_date" value={formData.birth_date || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Whatsapp</label>
                    <input type="text" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="job" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pekerjaan</label>
                    <input type="text" id="job" name="job" value={formData.job || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Perusahaan</label>
                    <input type="text" id="company_name" name="company_name" value={formData.company_name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="undergraduate_university" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Universitas (S1)</label>
                    <input type="text" id="undergraduate_university" name="undergraduate_university" value={formData.undergraduate_university || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" disabled={isSubmitting} />
                </div>
            </div>
            <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
                {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-32 h-32 rounded-md object-cover" />}
                <input type="file" name="photo" id="photo" onChange={handleChange} accept="image/*" className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-600 dark:file:text-gray-200 dark:hover:file:bg-gray-500" disabled={isSubmitting} />
                {isEditing && currentItem.photo && <p className="text-xs text-gray-500 mt-1">Current photo will be replaced if you upload a new one.</p>}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                </button>
            </div>
        </form>
    );
};

const AlumniDetails = ({ alumnus }) => {
    if (!alumnus) return null;

    const detailItems = [
        { label: "Nama Lengkap", value: alumnus.name },
        { label: "Angkatan", value: alumnus.group },
        { label: "Tahun Lulus", value: alumnus.graduate_year },
        { label: "NIS / NISN", value: `${alumnus.nis || '-'} / ${alumnus.nisn || '-'}` },
        { label: "Jenis Kelamin", value: alumnus.gender === 'L' ? 'Laki-laki' : 'Perempuan' },
        { label: "Tempat, Tanggal Lahir", value: `${alumnus.birth_place || '-'}, ${alumnus.birth_date ? new Date(alumnus.birth_date).toLocaleDateString('id-ID') : '-'}` },
        { label: "Alamat", value: alumnus.address },
        { label: "Kota/Provinsi", value: `${alumnus.city || '-'}, ${alumnus.province || '-'}` },
        { label: "Whatsapp", value: alumnus.phone },
        { label: "Pekerjaan", value: alumnus.job },
        { label: "Nama Perusahaan", value: alumnus.company_name },
        { label: "Universitas (S1)", value: alumnus.undergraduate_university },
        { label: "Jurusan (S1)", value: alumnus.undergraduate_department },
        { label: "Universitas (S2)", value: alumnus.postgraduate_university },
        { label: "Jurusan (S2)", value: alumnus.postgraduate_department },
        { label: "Universitas (S3)", value: alumnus.doctoral_university },
        { label: "Jurusan (S3)", value: alumnus.doctoral_department },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <img src={alumnus.photo || 'https://placehold.co/150x150?text=No+Image'} alt={alumnus.name} className="w-24 h-24 rounded-full object-cover" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{alumnus.name}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {detailItems.map(item => (
                    <div key={item.label} className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <dt className="font-medium text-gray-500 dark:text-gray-400">{item.label}</dt>
                        <dd className="text-gray-900 dark:text-white">{item.value || '-'}</dd>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const AlumniPage = () => {
    const [alumni, setAlumni] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [count, setCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAlumnusForDetails, setSelectedAlumnusForDetails] = useState(null);

    const { authHeader, isAuthenticated } = useAuth();

    const apiService = useMemo(() => ({
        get: async (url) => {
            const response = await fetch(url, { headers: { ...authHeader() } });
            if (!response.ok) throw new Error('Failed to fetch alumni');
            return response.json();
        },
        post: async (formData) => {
            const response = await fetch(API_URL, { method: 'POST', headers: { ...authHeader() }, body: formData });
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
            const response = await fetch(`${API_URL}${id}/`, { method: 'PUT', headers: { ...authHeader() }, body: formData });
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
            const response = await fetch(`${API_URL}${id}/`, { method: 'DELETE', headers: { ...authHeader() } });
            if (!response.ok && response.status !== 204) throw new Error('Failed to delete alumni');
            return response;
        },
    }), [authHeader]);

    const fetchAlumni = useCallback(async (url) => {
        setIsDataLoading(true);
        setError(null);
        try {
            const data = await apiService.get(url);
            setAlumni(data.results || []);
            setCount(data.count || 0);
            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
        } catch (err) {
            setError('Failed to fetch alumni data. Please try again later.');
            console.error(err);
        } finally {
            setIsDataLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const url = `${API_URL}?search=${searchTerm}&page_size=${PAGE_SIZE}`;
            fetchAlumni(url);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, fetchAlumni]);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, formData);
            } else {
                await apiService.post(formData);
            }
            closeModal();
            fetchAlumni(`${API_URL}?search=${searchTerm}&page_size=${PAGE_SIZE}`);
        } catch (err) {
            console.error("Failed to save alumni:", err);
            alert(`Failed to save alumni. Error: ${err.message}`);
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

    const handleDetails = (item) => {
        setSelectedAlumnusForDetails(item);
        setIsDetailsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this alumnus?')) {
            try {
                await apiService.delete(id);
                fetchAlumni(`${API_URL}?search=${searchTerm}&page_size=${PAGE_SIZE}`);
                // If the deleted item is the one in the details modal, close it
                if (selectedAlumnusForDetails && selectedAlumnusForDetails.id === id) {
                    closeDetailsModal();
                }
            } catch (err) {
                setError(`Delete failed: ${err.message}.`);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedAlumnusForDetails(null);
    }

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handlePageChange = (url) => { if (url) fetchAlumni(url); };

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">Alumni Database</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-white">Browse and search through the list of alumni.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add New Alumni
                    </button>
                )}
            </header>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <main>
                {isDataLoading ? (
                    <LoadingAlumniTable />
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Alumni List</h2>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Lengkap</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Angkatan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tahun Lulus</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Universitas (S1)</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pekerjaan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Whatsapp</th>
                                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {alumni.length > 0 ? (
                                        alumni.map((alum) => (
                                            <tr key={alum.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{alum.name || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{alum.group || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{alum.graduate_year || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{alum.undergraduate_university || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{alum.job || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{alum.phone || '-'}</td>
                                                {isAuthenticated && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button onClick={() => handleDetails(alum)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">Details</button>
                                                        <button onClick={() => handleEdit(alum)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer">Edit</button>
                                                        <button onClick={() => handleDelete(alum.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 cursor-pointer">Delete</button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isAuthenticated ? 7 : 6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                                                {searchTerm ? 'No alumni match your search.' : 'No alumni found.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {count > PAGE_SIZE && (
                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Total <span className="font-medium">{count}</span> results
                                </span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit Alumni' : 'Add New Alumni'}>
                <AlumniForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title="Alumni Details">
                <AlumniDetails alumnus={selectedAlumnusForDetails} />
            </Modal>
        </>
    );
};

export default AlumniPage;
