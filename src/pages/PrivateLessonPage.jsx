import React, { useState, useEffect, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrivateLessons } from '../hooks/usePrivateLessons';
import Modal from '../common/Modal.jsx';
import { debounce } from 'lodash';
import LoadingSpinner from '../common/LoadingSpinner';
import { SkeletonCard } from '../common/Skeleton.jsx';

const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;
const SUBJECTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/private-subjects/`;
const GROUPS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/private-groups/`;
const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;

const LessonForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({ pembimbing: null, pelajaran: null, tanggal_bimbingan: '', waktu_bimbingan: '', catatan_bimbingan: '', kelompok: null, kehadiran_santri: [], foto: null });
    const { authHeader } = useAuth();
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                pembimbing: currentItem.pembimbing? { value: currentItem.pembimbing.id, label: currentItem.pembimbing.teacher_name } : null,
                pelajaran: currentItem.pelajaran ? { value: currentItem.pelajaran.id, label: currentItem.pelajaran.nama_pelajaran } : null,
                tanggal_bimbingan: currentItem.tanggal_bimbingan || '',
                waktu_bimbingan: currentItem.waktu_bimbingan || '',
                catatan_bimbingan: currentItem.catatan_bimbingan || '',
                kelompok: currentItem.kelompok ? { value: currentItem.kelompok.id, label: currentItem.kelompok.nama_kelompok } : null,
                kehadiran_santri: (currentItem.kehadiran_santri || []).map(s => ({ value: s.id, label: s.student_name })),
                foto: null, // Do not pre-fill file inputs
            });
            setPhotoPreview(currentItem.foto);
        } else {
            setFormData({ pembimbing: null, pelajaran: null, tanggal_bimbingan: '', waktu_bimbingan: '', catatan_bimbingan: '', kelompok: null, kehadiran_santri: [], foto: null });
            setPhotoPreview(null);
        }
    }, [currentItem]);

    const loadOptions = async (apiUrl, search, mapping) => {
        try {
            const response = await fetch(`${apiUrl}?search=${search}`, { headers: { ...authHeader() } });
            const data = await response.json();
            return (data.results || data).map(mapping);
        } catch (error) { console.error("Error loading options:", error); return []; }
    };

    const debouncedLoadTeachers = debounce((s, c) => loadOptions(TEACHERS_API_URL, s, i => ({ value: i.id, label: i.teacher_name })).then(c), 300);
    const debouncedLoadSubjects = debounce((s, c) => loadOptions(SUBJECTS_API_URL, s, i => ({ value: i.id, label: i.nama_pelajaran })).then(c), 300);
    const debouncedLoadGroups = debounce((s, c) => loadOptions(GROUPS_API_URL, s, i => ({ value: i.id, label: i.nama_kelompok })).then(c), 300);
    const debouncedLoadStudents = debounce((s, c) => loadOptions(STUDENTS_API_URL, s, i => ({ value: i.id, label: i.student_name })).then(c), 300);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (name, selected) => setFormData(prev => ({ ...prev, [name]: selected }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value === null) return;
            if (key === 'pembimbing' || key === 'pelajaran' || key === 'kelompok') {
                if (value.value) submissionData.append(key, value.value);
            } else if (key === 'kehadiran_santri') {
                value.forEach(s => submissionData.append(key, s.value));
            } else if (key === 'foto' && value instanceof File) {
                submissionData.append(key, value);
            } else if (key !== 'foto') {
                submissionData.append(key, value);
            }
        });
        onSave(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AsyncSelect cacheOptions defaultOptions loadOptions={debouncedLoadTeachers} value={formData.pembimbing} onChange={val => handleSelectChange('pembimbing', val)} placeholder="Pilih Pembimbing" className="react-select-container" classNamePrefix="react-select" />
                <AsyncSelect cacheOptions defaultOptions loadOptions={debouncedLoadSubjects} value={formData.pelajaran} onChange={val => handleSelectChange('pelajaran', val)} placeholder="Pilih Pelajaran" className="react-select-container" classNamePrefix="react-select" />
                <input type="date" name="tanggal_bimbingan" value={formData.tanggal_bimbingan} onChange={handleChange} required className="input-style" />
                <input type="time" name="waktu_bimbingan" value={formData.waktu_bimbingan} onChange={handleChange} required className="input-style" />
                <AsyncSelect cacheOptions defaultOptions loadOptions={debouncedLoadGroups} value={formData.kelompok} onChange={val => handleSelectChange('kelompok', val)} placeholder="Pilih Kelompok (Opsional)" isClearable className="react-select-container" classNamePrefix="react-select" />
            </div>
            <AsyncSelect isMulti cacheOptions defaultOptions loadOptions={debouncedLoadStudents} value={formData.kehadiran_santri} onChange={val => handleSelectChange('kehadiran_santri', val)} placeholder="Pilih Kehadiran Santri" className="react-select-container" classNamePrefix="react-select" />
            <textarea name="catatan_bimbingan" value={formData.catatan_bimbingan} onChange={handleChange} placeholder="Catatan Bimbingan" className="input-style w-full" />
            <div>
                <label htmlFor="foto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bukti Foto</label>
                {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-40 h-40 object-cover rounded-md" />}
                <input type="file" name="foto" id="foto" onChange={handleChange} accept="image/jpeg,image/png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
            </div>
        </form>
    );
};

const PrivateLessonCard = ({ lesson, onEdit, onDelete }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const formatTime = (time) => time.slice(0, 5);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {lesson.foto && (
                <img src={lesson.foto} alt={`Bimbingan ${lesson.pelajaran?.nama_pelajaran}`} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{lesson.pelajaran?.nama_pelajaran}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pembimbing: {lesson.pembimbing.teacher_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(lesson.tanggal_bimbingan)} - {formatTime(lesson.waktu_bimbingan)}
                </p>
                {lesson.kelompok && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Kelompok: {lesson.kelompok.nama_kelompok}</p>
                )}
                <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Kehadiran:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {lesson.kehadiran_santri?.map(santri => (
                            <li key={santri.id}>{santri.student_name}</li>
                        ))}
                    </ul>
                </div>
                {lesson.catatan_bimbingan && (
                    <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Catatan:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.catatan_bimbingan}</p>
                    </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {lesson.semester || 'Ganjil'} - {lesson.tahun_ajaran}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => onEdit(lesson)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                    <button onClick={() => onDelete(lesson.id)} className="text-sm text-red-600 hover:text-red-900 font-medium">Delete</button>
                </div>
            </div>
        </div>
    );
};

const PrivateLessonPage = () => {
    const { lessons, loading, loadingMore, error, nextPage, createLesson, updateLesson, deleteLesson, loadMore, refetch } = usePrivateLessons();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useCallback(debounce((query) => {
        refetch(query);
    }, 500), [refetch]);

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

    const handleEdit = (lesson) => {
        setCurrentItem(lesson);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lesson report?')) {
            await deleteLesson(id);
        }
    };

    const handleSave = async (lessonData) => {
        setIsSubmitting(true);
        try {
            if (currentItem) {
                await updateLesson(currentItem.id, lessonData);
            } else {
                await createLesson(lessonData);
            }
            closeModal();
        } catch (err) {
            // Error toast is handled in the hook
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Private Lesson Reports</h1>
                    <button onClick={handleAddNew} className="btn-primary">Add New Report</button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : lessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.map(lesson => (
                        <PrivateLessonCard key={lesson.id} lesson={lesson} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                    {loadingMore && [...Array(3)].map((_, i) => <SkeletonCard key={`loading-${i}`} />)}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada data bimbingan privat.</p>
                </div>
            )}
            {nextPage && !loadingMore && (
                <div className="mt-6 text-center">
                    <button onClick={loadMore} className="btn-primary">
                        Load More
                    </button>
                </div>
            )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Laporan' : 'Tambah Laporan Baru'}>
                <LessonForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
};

export default PrivateLessonPage;