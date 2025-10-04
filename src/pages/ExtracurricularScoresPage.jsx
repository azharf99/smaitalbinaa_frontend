import React, { useState, useEffect, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner';
import { useExtracurricularScores } from '../hooks/useExtracurricularScores.js';
import Modal from '../common/Modal.jsx';
import { debounce } from 'lodash';
import { SkeletonRow } from '../common/Skeleton.jsx';

const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;
const EXTRACURRICULARS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/extracurriculars/`;
const SCORE_CHOICES = ['A', 'B', 'C', 'D', 'E'];

const ScoreForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({ student_id: null, extracurricular_id: null, score: 'B', semester: '', academic_year: '' });
    const { authHeader } = useAuth();

    useEffect(() => {
        if (currentItem) {
            setFormData({
                student_id: currentItem.student ? { value: currentItem.student.id, label: currentItem.student.student_name } : null,
                extracurricular_id: currentItem.extracurricular ? { value: currentItem.extracurricular.id, label: currentItem.extracurricular.name } : null,
                score: currentItem.score || 'B',
                semester: currentItem.semester || '',
                academic_year: currentItem.academic_year || '',
            });
        } else {
            setFormData({ student_id: null, extracurricular_id: null, score: 'B', semester: '', academic_year: '' });
        }
    }, [currentItem]);

    const loadOptions = async (apiUrl, inputValue, mapping) => {
        if (!inputValue) {
            return [];
        }
        try {
            const response = await fetch(`${apiUrl}?search=${inputValue}`, { headers: { ...authHeader() } });
            const data = await response.json();
            return (data.results || data).map(mapping);
        } catch (error) {
            console.error("Error loading options:", error);
            return [];
        }
    };

    const debouncedLoadStudents = debounce((inputValue, callback) => {
        loadOptions(STUDENTS_API_URL, inputValue, s => ({ value: s.id, label: s.student_name })).then(callback);
    }, 300);

    const debouncedLoadExtracurriculars = debounce((inputValue, callback) => {
        loadOptions(EXTRACURRICULARS_API_URL, inputValue, e => ({ value: e.id, label: e.name })).then(callback);
    }, 300);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            student_id: formData.student_id?.value,
            extracurricular_id: formData.extracurricular_id?.value,
        };
        onSave(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AsyncSelect cacheOptions loadOptions={debouncedLoadStudents} value={formData.student_id} onChange={val => handleSelectChange('student_id', val)} placeholder="Pilih Santri" className="react-select-container" classNamePrefix="react-select" required />
                <AsyncSelect cacheOptions loadOptions={debouncedLoadExtracurriculars} value={formData.extracurricular_id} onChange={val => handleSelectChange('extracurricular_id', val)} placeholder="Pilih Ekstrakurikuler" className="react-select-container" classNamePrefix="react-select" required />
                <div>
                    <label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nilai</label>
                    <select name="score" id="score" value={formData.score} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required>
                        {SCORE_CHOICES.map(choice => <option key={choice} value={choice}>{choice}</option>)}
                    </select>
                </div>
                <input type="text" name="semester" placeholder="Semester (e.g., Ganjil)" value={formData.semester} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 self-end" />
                <input type="text" name="academic_year" placeholder="Tahun Ajaran (e.g., 2023/2024)" value={formData.academic_year} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 self-end" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
            </div>
        </form>
    );
};

const ExtracurricularScoresPage = () => {
    const { scores, count, nextPage, previousPage, loading, error, createScore, updateScore, deleteScore, refetch } = useExtracurricularScores();
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

    const handleEdit = (score) => {
        setCurrentItem(score);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this score?')) {
            await deleteScore(id);
        }
    };

    const handleSave = async (scoreData) => {
        setIsSubmitting(true);
        try {
            if (currentItem) {
                await updateScore(currentItem.id, scoreData);
            } else {
                await createScore(scoreData);
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Nilai Ekstrakurikuler</h1>
                    <button onClick={handleAddNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed">Add New Score</button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search scores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-xs p-2 text-gray-900 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Santri</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ekstrakurikuler</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nilai</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tahun Ajaran</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    [...Array(10)].map((_, i) => <SkeletonRow key={i} columns={6} />)
                                ) : scores.length > 0 ? scores.map((score) => (
                                    <tr key={score.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{score.student?.student_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{score.extracurricular?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{score.score}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{score.semester || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{score.academic_year || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(score)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            <button onClick={() => handleDelete(score.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-gray-500 dark:text-gray-400">No scores found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-400">
                            Showing <span className="font-semibold">{scores.length}</span> of <span className="font-semibold">{count}</span> results
                        </span>
                        <div className="inline-flex -space-x-px">
                            <button onClick={() => refetch(previousPage)} disabled={!previousPage || loading} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Previous</button>
                            <button onClick={() => refetch(nextPage)} disabled={!nextPage || loading} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Score' : 'Add New Score'}>
                <ScoreForm
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
};

export default ExtracurricularScoresPage;