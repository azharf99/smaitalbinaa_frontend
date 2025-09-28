import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import { useCourses } from '../hooks/useCourses.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SUBJECTS_API_URL = `${API_BASE_URL}/api/v1/subjects/`;
const TEACHERS_API_URL = `${API_BASE_URL}/api/v1/teachers/`;
const CLASSES_API_URL = `${API_BASE_URL}/api/v1/classes/`;

const initialState = {
    course: '',
    course_code: '',
    teacher: '',
    type: 'Ikhwan',
    class_assigned: '',
    periods_per_week: 1,
    consecutive_periods_needed: 1,
};

const CourseForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const fetchRelatedData = async () => {
            try {
                const [subjectsRes, teachersRes, classesRes] = await Promise.all([
                    fetch(SUBJECTS_API_URL),
                    fetch(TEACHERS_API_URL),
                    fetch(CLASSES_API_URL)
                ]);
                const subjectsData = await subjectsRes.json();
                const teachersData = await teachersRes.json();
                const classesData = await classesRes.json();
                setSubjects(subjectsData.results || subjectsData);
                setTeachers(teachersData.results || teachersData);
                setClasses(classesData.results || classesData);
            } catch (error) {
                console.error("Error fetching related data for form:", error);
            }
        };
        fetchRelatedData();
    }, []);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                ...initialState,
                ...currentItem,
                course: currentItem.course?.id || '',
                teacher: currentItem.teacher?.id || '',
                class_assigned: currentItem.class_assigned?.id || '',
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700">Subject</label>
                    <select name="course" id="course" value={formData.course} onChange={handleChange} required className="mt-1 block w-full input-style" disabled={isSubmitting}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="course_code" className="block text-sm font-medium text-gray-700">Course Code</label>
                    <input type="text" name="course_code" id="course_code" value={formData.course_code} onChange={handleChange} className="mt-1 block w-full input-style" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">Teacher</label>
                    <select name="teacher" id="teacher" value={formData.teacher} onChange={handleChange} required className="mt-1 block w-full input-style" disabled={isSubmitting}>
                        <option value="">Select Teacher</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.teacher_name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="class_assigned" className="block text-sm font-medium text-gray-700">Class</label>
                    <select name="class_assigned" id="class_assigned" value={formData.class_assigned} onChange={handleChange} required className="mt-1 block w-full input-style" disabled={isSubmitting}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full input-style" disabled={isSubmitting}>
                        <option value="Ikhwan">Ikhwan</option>
                        <option value="Akhwat">Akhwat</option>
                        <option value="Campuran">Campuran</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="periods_per_week" className="block text-sm font-medium text-gray-700">Periods per Week</label>
                    <input type="number" name="periods_per_week" id="periods_per_week" min="1" value={formData.periods_per_week} onChange={handleChange} className="mt-1 block w-full input-style" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="consecutive_periods_needed" className="block text-sm font-medium text-gray-700">Consecutive Periods</label>
                    <input type="number" name="consecutive_periods_needed" id="consecutive_periods_needed" min="1" value={formData.consecutive_periods_needed} onChange={handleChange} className="mt-1 block w-full input-style" disabled={isSubmitting} />
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                </button>
            </div>
        </form>
    );
};

const CoursesTable = ({ items, onEdit, onDelete, error, hasSearchQuery }) => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 7 : 6;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Courses List</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periods/Week</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consecutive</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.course?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.course_code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.teacher?.teacher_name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.class_assigned?.short_class_name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.periods_per_week}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.consecutive_periods_needed}</td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns} className="px-6 py-4 text-center text-sm text-gray-500">{hasSearchQuery ? 'No courses match your search.' : 'No courses found.'}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 7 : 6;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 bg-gray-300 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody></table>
        </div>
    );
};

export default function CoursesPage() {
    const { items, count, nextPage, previousPage, isDataLoading, isSubmitting, error, searchQuery, setSearchQuery, saveCourse, deleteCourse, handlePageChange } = useCourses();
    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleSave = async (formData) => {
        try {
            await saveCourse(formData, currentItem);
            closeModal();
        } catch (err) {
            alert(`Failed to save course. Error: ${err.message}`);
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            await deleteCourse(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Course Management</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage academic courses for classes.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="btn-primary">Add New Course</button>
                )}
            </header>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="input-style"
                />
            </div>

            <main>
                {isDataLoading ? <LoadingTable /> : (
                    <>
                        <CoursesTable
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            error={error}
                            hasSearchQuery={!!searchQuery}
                        />
                        {(nextPage || previousPage) && (
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-700">Total <span className="font-medium">{count}</span> courses</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="btn-secondary">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="btn-secondary">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Course' : 'Add New Course'}>
                <CourseForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}