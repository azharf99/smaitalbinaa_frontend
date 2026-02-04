import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useExtracurricularReports } from '../hooks/useExtracurricularReports.js';
import Modal from '../common/Modal.jsx';
import { debounce } from 'lodash';
import { SkeletonCard } from '../common/Skeleton.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import customSelectStyles from '../common/CustomStyle';
import CustomSelect from '../common/Select.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useDropdownData } from '../hooks/useDropdownData.js';


const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;
const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;
const EXTRACURRICULARS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/extracurriculars/`;

const ReportForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({ extracurricular_id: null, teacher_ids: [], report_date: '', report_notes: '', student_ids: [], photo: null, semester: '', academic_year: '' });
    const [photoPreview, setPhotoPreview] = useState(null);
    const { authHeader } = useAuth();
    const { theme } = useTheme();
    const { teachers, students, extracurriculars, isLoading: dropdownLoading } = useDropdownData();
    

    useEffect(() => {
        if (currentItem) {
            setFormData({
                extracurricular_id: currentItem.extracurricular ? { value: currentItem.extracurricular.id, label: currentItem.extracurricular.name } : null,
                teacher_ids: (currentItem.teacher || []).map(t => ({ value: t.id, label: t.teacher_name })),
                report_date: currentItem.report_date || '',
                report_notes: currentItem.report_notes || '',
                student_ids: (currentItem.students || []).map(s => ({ value: s.id, label: s.student_name })),
                photo: null,
                semester: currentItem.semester || '',
                academic_year: currentItem.academic_year || '',
            });
            setPhotoPreview(currentItem.photo);
        } else {
            setFormData({ extracurricular_id: null, teacher_ids: [], report_date: '', report_notes: '', student_ids: [], photo: null, semester: '', academic_year: '' });
            setPhotoPreview(null);
        }
    }, [currentItem]);

    const loadOptions = async (apiUrl, inputValue, mapping) => {
        try {
            const searchParam = inputValue ? `?search=${encodeURIComponent(inputValue)}` : '';
            const response = await fetch(`${apiUrl}${searchParam}`, { headers: { ...authHeader() } });
            const data = await response.json();
            return (data.results || data).map(mapping);
        } catch (error) {
            console.error("Error loading options:", error);
            return [];
        }
    };

    const debouncedLoadStudents = debounce((s, c) => loadOptions(STUDENTS_API_URL, s, i => ({ value: i.id, label: i.student_name })).then(c), 100);
    const debouncedLoadTeachers = debounce((s, c) => loadOptions(TEACHERS_API_URL, s, i => ({ value: i.id, label: i.teacher_name })).then(c), 100);
    const debouncedLoadExtracurriculars = debounce((s, c) => loadOptions(EXTRACURRICULARS_API_URL, s, i => ({ value: i.id, label: i.name })).then(c), 100);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            if (file) setPhotoPreview(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (name, selected) => setFormData(prev => ({ ...prev, [name]: selected }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = new FormData();
        submissionData.append('extracurricular_id', formData.extracurricular_id?.value);
        formData.teacher_ids.forEach(t => submissionData.append('teacher_ids', t.value));
        formData.student_ids.forEach(s => submissionData.append('student_ids', s.value));
        submissionData.append('report_date', formData.report_date);
        submissionData.append('report_notes', formData.report_notes);
        submissionData.append('semester', formData.semester);
        submissionData.append('academic_year', formData.academic_year);
        if (formData.photo) {
            submissionData.append('photo', formData.photo);
        }
        onSave(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                    options={extracurriculars}
                    value={formData.extracurricular_id}
                    onChange={(value) => setFormData(prev => ({ ...prev, extracurricular_id: value }))}
                    placeholder="Pilih Ekstrakurikuler"
                    isDisabled={isSubmitting}
                    darkMode={theme === 'dark'}
                    className="mt-1"
                />
                <input
                    type="date"
                    name="report_date"
                    value={formData.report_date}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                />
            </div>
            <CustomSelect
                isMulti
                options={teachers}
                value={formData.teacher_ids}
                onChange={(value) => handleSelectChange('teacher_ids', value)}
                placeholder="Pilih Pembimbing"
                isDisabled={isSubmitting}
                darkMode={theme === 'dark'}
                className="mt-1"
            />
            <CustomSelect
                isMulti
                options={students}
                value={formData.student_ids}
                onChange={(value) => handleSelectChange('student_ids', value)}
                placeholder="Pilih Santri"
                isDisabled={isSubmitting}
                darkMode={theme === 'dark'}
                className="mt-1"
            />
            <textarea
                name="report_notes"
                value={formData.report_notes}
                onChange={handleChange}
                placeholder="Catatan Laporan"
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="semester"
                    placeholder="Semester (e.g., Ganjil)"
                    value={formData.semester}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <input
                    type="text"
                    name="academic_year"
                    placeholder="Tahun Ajaran (e.g., 2023/2024)"
                    value={formData.academic_year}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
            </div>
            <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Laporan</label>
                {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-40 h-40 object-cover rounded-md" />}
                <input
                    type="file"
                    name="photo"
                    id="photo"
                    onChange={handleChange}
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <LoadingSpinner /> : 'Save'}
                </button>
            </div>
        </form>
    );
};

const ReportCard = ({ report, onEdit, onDelete }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {report.photo && (
                <img src={report.photo} alt={`Laporan ${report.extracurricular?.name}`} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{report.extracurricular?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal: {formatDate(report.report_date)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pembimbing: {(report.teacher || []).map(t => t.teacher_name).join(', ')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Peserta: {(report.students || []).length} santri</p>
                {report.report_notes && (
                    <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Catatan:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{report.report_notes}</p>
                    </div>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => onEdit(report)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium dark:bg-gray-200 dark:p-1 dark:rounded-sm">Edit</button>
                    <button onClick={() => onDelete(report.id)} className="text-sm text-red-600 hover:text-red-900 font-medium dark:bg-gray-200 dark:p-1 dark:rounded-sm">Delete</button>
                </div>
            </div>
        </div>
    );
};

const ExtracurricularReportsPage = () => {
    const { reports, loading, loadingMore, error, nextPage, createReport, updateReport, deleteReport, loadMore, refetch } = useExtracurricularReports();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useCallback(debounce((query) => refetch(query), 500), [refetch]);

    useEffect(() => {
        debouncedSearch(searchTerm);
    }, [searchTerm, debouncedSearch]);

    if (error) {
        return <div className="text-center py-10 text-red-500">Terjadi kesalahan saat memuat data.</div>;
    }

    const handleAddNew = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (report) => {
        setCurrentItem(report);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            await deleteReport(id);
        }
    };

    const handleSave = async (reportData) => {
        setIsSubmitting(true);
        try {
            if (currentItem) {
                await updateReport(currentItem.id, reportData);
            } else {
                await createReport(reportData);
            }
            closeModal();
        } catch (err) {
            // Error is handled by toast in the hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Laporan Ekstrakurikuler</h1>
                    <button onClick={handleAddNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed">Add New Report</button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-xs p-2 text-gray-900 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map(report => (
                            <ReportCard key={report.id} report={report} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                        {loadingMore && [...Array(3)].map((_, i) => <SkeletonCard key={`loading-${i}`} />)}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No reports found.</p>
                    </div>
                )}
                {nextPage && !loadingMore && (
                    <div className="mt-6 text-center">
                        <button onClick={loadMore} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed">
                            Load More
                        </button>
                    </div>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Report' : 'Add New Report'}>
                <ReportForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
};

export default ExtracurricularReportsPage;