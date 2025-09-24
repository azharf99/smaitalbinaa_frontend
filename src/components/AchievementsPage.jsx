import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

// --- Helper Functions & Initial State ---
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/achievements/`;
const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/students/`;

const initialState = {
    category: '',
    type: '',
    level: '',
    year: new Date().getFullYear().toString(),
    name: '',
    organizer: '',
    awardee: '',
    student: '', // To hold the student ID
    awardee_class: '',
    field: '',
    predicate: '',
    certificate: null,
    photo: null,
};

// --- API Service ---
const getApiService = (authHeader) => ({
    get: async (url = API_URL) => {
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
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
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

const AchievementForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);


    // Fetch students for the dropdown
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(STUDENTS_API_URL);
                if (!response.ok) throw new Error('Failed to fetch students');
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, []);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (currentItem) {
            // Don't set file inputs, as they are write-only for security reasons
            const { photo, certificate, ...rest } = currentItem;
            setFormData({ ...initialState, ...rest });
            // Pre-fill search term if editing an existing item with a student
            if (currentItem.awardee) setSearchTerm(currentItem.awardee);
        } else {
            setSearchTerm('');
            setFormData(initialState);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStudentSelect = (student) => {
        setFormData(prev => ({
            ...prev,
            student: student.id,
            awardee: student.student_name,
            awardee_class: student.student_class.class_name || ''
        }));
        setSearchTerm(student.student_name);
        setIsDropdownOpen(false);
    };

    const filteredStudents = searchTerm
        ? students.filter(student =>
            student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const key in formData) {
            // Only append if the value is not null/undefined to avoid issues with backend
            if (formData[key] != null) {
                data.append(key, formData[key]);
            }
        }
        onSave(data);
    };

    const isEditing = !!(currentItem && currentItem.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Simplified form for brevity. Add all fields from your model here. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative" ref={dropdownRef}>
                    <label htmlFor="student" className="block text-sm font-medium text-gray-700">Student</label>
                    <input
                        type="text"
                        id="student-search"
                        placeholder="Search for a student..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                            if (formData.student) setFormData(prev => ({ ...prev, student: '', awardee: '', awardee_class: '' }));
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="mt-1 block w-full input-style text-gray-900"
                        disabled={isSubmitting}
                        autoComplete="off"
                    />
                    {isDropdownOpen && searchTerm && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                <li key={student.id} onClick={() => handleStudentSelect(student)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                    {student.student_name} ({student.student_class.class_name})
                                </li>
                            )) : <li className="px-4 py-2 text-gray-500">No students found</li>}
                        </ul>
                    )}
                </div>
                <div>
                    <label htmlFor="awardee" className="block text-sm font-medium text-gray-700">Awardee Name</label>
                    <input type="text" id="awardee" name="awardee" placeholder="Awardee Name (auto-filled)" value={formData.awardee || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting || !!formData.student} readOnly />
                </div>
                <div>
                    <label htmlFor="awardee_class" className="block text-sm font-medium text-gray-700">Awardee Class</label>
                    <input type="text" id="awardee_class" name="awardee_class" placeholder="Awardee Class (auto-filled)" value={formData.awardee_class || ''} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting || !!formData.student} readOnly />
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Achievement Name</label>
                    <input type="text" id="name" name="name" placeholder="Achievement Name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="predicate" className="block text-sm font-medium text-gray-700">Predicate</label>
                    <input type="text" id="predicate" name="predicate" placeholder="e.g., Gold Medal" value={formData.predicate || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level</label>
                    <input type="text" id="level" name="level" placeholder="e.g., National" value={formData.level || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                    <input type="number" id="year" name="year" placeholder="Year" value={formData.year || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Organizer</label>
                    <input type="text" id="organizer" name="organizer" placeholder="Organizer" value={formData.organizer || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input type="text" id="category" name="category" placeholder="Category" value={formData.category || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                    <input type="text" id="type" name="type" placeholder="Type" value={formData.type || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="field" className="block text-sm font-medium text-gray-700">Field</label>
                    <input type="text" id="field" name="field" placeholder="Field" value={formData.field || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                </div>
            </div>
             <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo</label>
                <input type="file" name="photo" id="photo" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" disabled={isSubmitting} />
                {isEditing && currentItem.photo && <p className="text-xs text-gray-500 mt-1">Current photo will be replaced if you upload a new one.</p>}
            </div>
            <div>
                <label htmlFor="certificate" className="block text-sm font-medium text-gray-700">Certificate (PDF)</label>
                <input type="file" name="certificate" id="certificate" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" disabled={isSubmitting} />
                {isEditing && currentItem.certificate && <p className="text-xs text-gray-500 mt-1">Current certificate will be replaced if you upload a new one.</p>}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                </button>
            </div>
        </form>
    );
};

const AchievementCard = ({ item, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img className="w-full h-56 object-cover object-center" src={item.photo || 'https://via.placeholder.com/400x300?text=No+Image'} alt={item.name} />
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-700 font-semibold">{item.awardee}</p>
                <p className="text-gray-600">{item.predicate} - {item.level} ({item.year})</p>
                <p className="text-sm text-gray-500 mt-2">Organized by: {item.organizer}</p>
                {isAuthenticated && (
                    <div className="mt-4 flex justify-end space-x-2">
                        <button onClick={() => onEdit(item)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium cursor-pointer">Edit</button>
                        <button onClick={() => onDelete(item.id)} className="text-sm text-red-600 hover:text-red-900 font-medium cursor-pointer">Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App Page Component ---

export default function AchievementsPage() {
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(API_URL);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { authHeader, isAuthenticated } = useAuth();
    const apiService = getApiService(authHeader);

    const fetchData = async (isInitial = true) => {
        if (!nextPageUrl) return;
        if (isInitial) {
            setIsInitialLoading(true);
        } else {
            setIsMoreLoading(true);
        }
        setError(null);
        try {
            const data = await apiService.get(nextPageUrl);
            setItems(prevItems => isInitial ? data.results : [...prevItems, ...data.results]);
            setNextPageUrl(data.next);
        } catch (err) {
            setError('Could not load achievements. Please try again later.');
        } finally {
            if (isInitial) {
                setIsInitialLoading(false);
            } else {
                setIsMoreLoading(false);
            }
        }
    };

    useEffect(() => {
        setNextPageUrl(API_URL); // Reset on mount
        fetchData(true);
    }, []);

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentItem && currentItem.id) {
                await apiService.put(currentItem.id, formData);
            } else {
                await apiService.post(formData);
            }
            closeModal();
            setNextPageUrl(API_URL); // Reset and refetch
            fetchData(true);
        } catch (err) {
            console.error("Failed to save achievement:", err);
            alert(`Failed to save achievement. Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null); // Use null for new item
        setIsModalOpen(true);
   };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this achievement?')) {
             try {
                await apiService.delete(id);
                setNextPageUrl(API_URL); // Reset and refetch
                fetchData(true);
            } catch (err) {
                 setError(`Delete failed: ${err.message}.`);
            }
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    }

    return (
        <>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Achievements</h1>
                    <p className="mt-2 text-lg text-gray-600">Celebrating our students' success.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        Add New Achievement
                    </button>
                )}
            </header>

            <main>
                {isInitialLoading ? (
                    <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.length > 0 ? items.map(item => (
                                <AchievementCard
                                    key={item.id}
                                    item={item}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            )) : (
                               <div className="col-span-full text-center text-gray-500 py-8">No achievements found.</div>
                            )}
                        </div>
                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => fetchData(false)}
                                    disabled={isMoreLoading}
                                    className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isMoreLoading ? <LoadingSpinner /> : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit Achievement' : 'Add New Achievement'}>
                <AchievementForm 
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}
