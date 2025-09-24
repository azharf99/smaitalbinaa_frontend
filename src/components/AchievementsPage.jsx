import React, { useState, useEffect } from 'react';
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
    get: async () => {
        const response = await fetch(API_URL);
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

    useEffect(() => {
        if (currentItem) {
            // Don't set file inputs, as they are write-only for security reasons
            const { photo, certificate, ...rest } = currentItem;
            setFormData({ ...initialState, ...rest });
        } else {
            setFormData(initialState);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            if (name === 'student') {
                const selectedStudent = students.find(s => s.id === parseInt(value, 10));
                setFormData(prev => ({
                    ...prev,
                    student: selectedStudent ? selectedStudent.id : '',
                    awardee: selectedStudent ? selectedStudent.student_name : '',
                    awardee_class: selectedStudent ? selectedStudent.student_class_name : ''
                }));
            }
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

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
                <div>
                    <label htmlFor="student" className="block text-sm font-medium text-gray-700">Student</label>
                    <select id="student" name="student" value={formData.student || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting}>
                        <option value="" disabled>Select a student</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.student_name} ({student.student_class_name})
                            </option>
                        ))}
                    </select>
                </div>
                <input type="text" name="awardee" placeholder="Awardee Name (auto-filled)" value={formData.awardee || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting || !!formData.student} />
                <input type="text" name="awardee_class" placeholder="Awardee Class" value={formData.awardee_class || ''} onChange={handleChange} className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="text" name="name" placeholder="Achievement Name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="text" name="predicate" placeholder="Predicate (e.g., Gold Medal)" value={formData.predicate || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="text" name="level" placeholder="Level (e.g., National)" value={formData.level || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="number" name="year" placeholder="Year" value={formData.year || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="text" name="organizer" placeholder="Organizer" value={formData.organizer || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="text" name="category" placeholder="Category" value={formData.category || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="text" name="type" placeholder="Type" value={formData.type || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
                <input type="text" name="field" placeholder="Field" value={formData.field || ''} onChange={handleChange} required className="mt-1 block w-full input-style text-gray-900" disabled={isSubmitting} />
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
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmitting}>
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
                        <button onClick={() => onEdit(item)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                        <button onClick={() => onDelete(item.id)} className="text-sm text-red-600 hover:text-red-900 font-medium">Delete</button>
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
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { authHeader, isAuthenticated } = useAuth();
    const apiService = getApiService(authHeader);

    const fetchData = async () => {
        setIsDataLoading(true);
        setError(null);
        try {
            const data = await apiService.get();
            setItems(data);
        } catch (err) {
            setError('Could not load achievements. Please try again later.');
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
            fetchData();
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
               fetchData();
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
                    <button onClick={handleAddNew} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Add New Achievement
                    </button>
                )}
            </header>

            <main>
                {isDataLoading ? (
                    <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>
                ) : (
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
