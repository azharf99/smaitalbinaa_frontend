import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import { useExtracurriculars } from '../hooks/useExtracurriculars.js';
import { debounce } from 'lodash';

const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;
const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;

const initialState = {
    name: '',
    short_name: '',
    teacher: [],
    schedule: '',
    time: '',
    members: [],
    description: '',
    logo: null,
    type: '',
    category: '',
    status: 'Aktif',
};

const ExtracurricularForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);
    const [logoPreview, setLogoPreview] = useState(null);
    const { authHeader } = useAuth();

    const loadOptions = async (apiUrl, inputValue, mapping) => {
        if (!inputValue) {
            return [];
        }
        try {
            const response = await fetch(`${apiUrl}?search=${inputValue}`, { headers: { ...authHeader() } });
            const data = await response.json();
            return (data.results || []).map(mapping);
        } catch (error) {
            console.error("Error loading options:", error);
            return [];
        }
    };

    const debouncedLoadTeachers = debounce((inputValue, callback) => {
        loadOptions(TEACHERS_API_URL, inputValue, t => ({ value: t.id, label: t.teacher_name })).then(callback);
    }, 300);

    const debouncedLoadStudents = debounce((inputValue, callback) => {
        loadOptions(STUDENTS_API_URL, inputValue, s => ({ value: s.id, label: `${s.student_name} (${s.student_class.class_name})` })).then(callback);
    }, 300);

    useEffect(() => {
        if (currentItem) {
            const { logo, ...rest } = currentItem;
            setFormData({
                ...initialState,
                ...rest,
                // Map teacher and member objects to the format react-select expects
                teacher: (currentItem.teacher_details || []).map(t => ({ value: t.id, label: t.teacher_name })),
                members: (currentItem.member_details || []).map(s => ({ value: s.id, label: s.student_name })),
            });
            setLogoPreview(currentItem.logo);
        } else {
            setFormData(initialState);
            setLogoPreview(null);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, type, files, selectedOptions } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
            setLogoPreview(URL.createObjectURL(file));
        } else if (type === 'select-multiple') {
            const values = Array.from(selectedOptions, option => option.value);
            setFormData(prev => ({ ...prev, [name]: values }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleSelectChange = (name, selectedOptions) => {
        setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const key in formData) {
            if ((key === 'teacher' || key === 'members') && Array.isArray(formData[key])) {
                formData[key].forEach(item => data.append(key, item.value)); // Append only the ID
            } else if (formData[key] !== null) {
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full input-style" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="short_name" className="block text-sm font-medium text-gray-700">Short Name</label>
                    <input type="text" name="short_name" id="short_name" value={formData.short_name || ''} onChange={handleChange} className="mt-1 block w-full input-style" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">Teachers</label>
                    <AsyncSelect
                        isMulti
                        id="teacher"
                        name="teacher"
                        cacheOptions
                        defaultOptions
                        value={formData.teacher}
                        loadOptions={debouncedLoadTeachers}
                        onChange={options => handleSelectChange('teacher', options)}
                        isDisabled={isSubmitting}
                    />
                </div>
                <div>
                    <label htmlFor="members" className="block text-sm font-medium text-gray-700">Members</label>
                    <AsyncSelect
                        isMulti
                        id="members"
                        name="members"
                        cacheOptions
                        defaultOptions
                        value={formData.members}
                        loadOptions={debouncedLoadStudents}
                        onChange={options => handleSelectChange('members', options)}
                        isDisabled={isSubmitting}
                    />
                </div>
                <div>
                    <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">Schedule</label>
                    <input type="text" name="schedule" id="schedule" value={formData.schedule || ''} onChange={handleChange} className="mt-1 block w-full input-style" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                    <input type="text" name="time" id="time" value={formData.time || ''} onChange={handleChange} className="mt-1 block w-full input-style" disabled={isSubmitting} />
                </div>
            </div>
            <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Logo</label>
                {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 w-32 h-32 rounded-md object-cover" />}
                <input type="file" name="logo" id="logo" accept="image/jpeg,image/png" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" disabled={isSubmitting} />
                {isEditing && currentItem.logo && <p className="text-xs text-gray-500 mt-1">Current logo will be replaced if you upload a new one.</p>}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}</button>
            </div>
        </form>
    );
};

const ExtracurricularImportForm = ({ onImport, onCancel, isSubmitting }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            onImport(file);
        } else {
            alert('Please select a CSV file to import.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700">Upload CSV File</label>
                <input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-2">Required columns: `name`. Optional: `short_name`, `schedule`, `time`, `type`, `category`, `status`, `teacher_ids`, `member_ids` (comma-separated IDs).</p>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !file}>{isSubmitting ? <LoadingSpinner /> : 'Import'}</button>
            </div>
        </form>
    );
};

const ExtracurricularsTable = ({ items, onEdit, onDelete, error, hasSearchQuery }) => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Extracurriculars List</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <img className="h-10 w-10 rounded-full object-cover" src={item.logo || 'https://via.placeholder.com/150'} alt={item.name} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.schedule}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns} className="px-6 py-4 text-center text-sm text-gray-500">{hasSearchQuery ? 'No results match your search.' : 'No extracurriculars found.'}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 bg-gray-300 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody></table>
        </div>
    );
};

export default function ExtracurricularsPage() {
    const { items, count, nextPage, previousPage, isDataLoading, isSubmitting, error, searchQuery, setSearchQuery, saveExtracurricular, deleteExtracurricular, handlePageChange, exportExtracurriculars, importExtracurriculars } = useExtracurriculars();
    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleSave = async (formData) => {
        try {
            await saveExtracurricular(formData, currentItem);
            closeModal();
        } catch (err) {
            alert(`Failed to save extracurricular. Error: ${err.message}`);
        }
    };

    const handleImport = async (file) => {
        try {
            await importExtracurriculars(file);
            closeImportModal();
            alert('Extracurriculars imported successfully!');
        } catch (err) {
            const errorData = JSON.parse(err.message);
            alert(`Import failed: ${errorData.detail || 'An unknown error occurred.'}`);
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
        if (window.confirm('Are you sure you want to delete this extracurricular?')) {
            await deleteExtracurricular(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const openImportModal = () => {
        setIsImportModalOpen(true);
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Extracurriculars</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage school extracurricular activities.</p>
                </div>
                {isAuthenticated && (
                    <div className="flex space-x-2">
                        <button onClick={handleAddNew} className="btn-primary">Add New Extracurricular</button>
                        <button onClick={openImportModal} className="btn-secondary">Import from CSV</button>
                        <button onClick={exportExtracurriculars} className="btn-secondary">Export to CSV</button>
                    </div>
                )}
            </header>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search extracurriculars..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="input-style"
                />
            </div>

            <main>
                {isDataLoading ? <LoadingTable /> : (
                    <>
                        <ExtracurricularsTable
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            error={error}
                            hasSearchQuery={!!searchQuery}
                        />
                        {(nextPage || previousPage) && (
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-700">Total <span className="font-medium">{count}</span> items</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="btn-secondary">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="btn-secondary">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Extracurricular' : 'Add New Extracurricular'}>
                <ExtracurricularForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            <Modal isOpen={isImportModalOpen} onClose={closeImportModal} title="Import Extracurriculars from CSV">
                <ExtracurricularImportForm
                    onImport={handleImport}
                    onCancel={closeImportModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}