import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import CustomSelect from '../common/Select.jsx';
import { useStudentProjects } from '../hooks/useStudentProjects.js';
import { useDropdownData } from '../hooks/useDropdownData.js';

const initialState = {
    project_name: '',
    start_date: '',
    end_date: '',
    team_id: null,
    teacher_id: null,
    description: '',
    step_to_achieve: '',
    task_organizing: '',
    semester: '',
    academic_year: '',
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// --- UI Components ---

const StudentProjectForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const { theme } = useTheme();
    const { teachers, teams, isLoading: dropdownLoading } = useDropdownData();

    useEffect(() => {
        if (currentItem) {
            setFormData({
                ...initialState,
                ...currentItem,
                team_id: currentItem.team?.id || null,
                teacher_id: currentItem.teacher?.id || null,
                start_date: formatDateForInput(currentItem.start_date),
                end_date: formatDateForInput(currentItem.end_date),
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
                    <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input type="text" id="project_name" name="project_name" placeholder="Project Name" value={formData.project_name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="team_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
                    <CustomSelect
                        options={teams}
                        value={formData.team_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, team_id: value }))}
                        placeholder="Select a team"
                        isDisabled={isSubmitting || dropdownLoading}
                        darkMode={theme === 'dark'}
                        className="mt-1"
                    />
                </div>
                <div>
                    <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teacher</label>
                    <CustomSelect
                        options={teachers}
                        value={formData.teacher_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, teacher_id: value }))}
                        placeholder="Select a teacher"
                        isDisabled={isSubmitting || dropdownLoading}
                        darkMode={theme === 'dark'}
                        className="mt-1"
                    />
                </div>
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" id="start_date" name="start_date" value={formData.start_date || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" id="end_date" name="end_date" value={formData.end_date || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                    <input type="text" id="semester" name="semester" placeholder="Semester" value={formData.semester || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <input type="text" id="academic_year" name="academic_year" placeholder="Academic Year" value={formData.academic_year || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" placeholder="Description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
            </div>
            <div>
                <label htmlFor="step_to_achieve" className="block text-sm font-medium text-gray-700">Steps to Achieve</label>
                <textarea id="step_to_achieve" name="step_to_achieve" placeholder="Steps to achieve the project" value={formData.step_to_achieve || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
            </div>
            <div>
                <label htmlFor="task_organizing" className="block text-sm font-medium text-gray-700">Task Organizing</label>
                <textarea id="task_organizing" name="task_organizing" placeholder="Task organizing details" value={formData.task_organizing || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
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

const StudentProjectsTable = ({ items, onEdit, onDelete, error, hasSearchQuery }) => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Student Projects List</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.project_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.team?.team_leader?.student_name || 'No Team'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.teacher?.teacher_name || 'No Teacher'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}
                            </td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : !error && (
                       <tr><td colSpan={isAuthenticated ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                           {hasSearchQuery ? 'No projects match your search.' : 'No projects found.'}
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingStudentProjectsTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 dark:text-gray-600 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody></table>
        </div>
    );
};

// --- Main Page Component ---

export default function StudentProjectsPage() {
    const {
        items,
        count,
        nextPage,
        previousPage,
        isDataLoading,
        isSubmitting,
        error,
        searchQuery,
        setSearchQuery,
        saveStudentProject,
        deleteStudentProject,
        handlePageChange
    } = useStudentProjects();

    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { isAuthenticated } = useAuth();

    const handleSave = async (formData) => {
        try {
            await saveStudentProject(formData, currentItem);
            closeModal();
        } catch (err) {
            console.error("Failed to save student project:", err);
            alert(`Failed to save student project. Error: ${err.message}`);
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
        if (window.confirm('Are you sure you want to delete this student project?')) {
            await deleteStudentProject(id);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">Student Projects Management</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-white">Manage student project information.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        Add New Project
                    </button>
                )}
            </header>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by project name..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                    <LoadingStudentProjectsTable />
                ) : (
                    <>
                        <StudentProjectsTable
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            error={error}
                            hasSearchQuery={!!searchQuery}
                        />
                        {count > 0 && (
                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    Total <span className="font-medium">{count}</span> results
                                </span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit Student Project' : 'Add New Student Project'}>
                <StudentProjectForm 
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}
