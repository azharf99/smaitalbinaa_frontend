import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

const OlympiadReportForm = ({ isOpen, onClose, onSubmit, report, apiService, isSubmitting: isFormSubmitting }) => {    const [formData, setFormData] = useState({
        olympiad_field: null,
        students: [],
        report_date: '',
        notes: '',
        report_photo: null,
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(isFormSubmitting);

    useEffect(() => {
        if (report) {
            setFormData({
                olympiad_field: report.field_name ? { value: report.field_name.id, label: `${report.field_name.field_name} (${report.field_name.type})` } : null,
                students: report.students.map(s => ({ value: s.id, label: s.student_name })),
                report_date: report.report_date || '',
                notes: report.notes || '',
                report_photo: null,
            });
            setPhotoPreview(report.report_photo);
        } else {
            // Reset form for new entry
            setFormData({
                olympiad_field: null,
                students: [],
                report_date: '',
                notes: '',
                report_photo: null,
            });
            setPhotoPreview(null);
        }
    }, [report, isOpen]);

    useEffect(() => {
        setIsSubmitting(isFormSubmitting);
    }, [isFormSubmitting]);

    const loadOptions = async (endpoint, search, mapFn) => {
        try {
            const response = await apiService.get(endpoint, { search });
            return (response.data.results || response.data).map(mapFn);
        } catch (error) {
            console.error(`Error loading ${endpoint}:`, error);
            return [];
        }
    };

    const debouncedLoad = (endpoint, mapFn) => debounce((inputValue, callback) => {
        loadOptions(endpoint, inputValue, mapFn).then(callback);
    }, 300);

    const loadOlympiadFields = debouncedLoad('olympiad-fields', item => ({ value: item.id, label: `${item.field_name} (${item.type})` }));
    const loadStudents = debouncedLoad('students', item => ({ value: item.id, label: item.student_name }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, selected) => {
        setFormData(prev => ({ ...prev, [name]: selected }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, report_photo: file }));
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const submissionData = new FormData();
        submissionData.append('field_name_id', formData.olympiad_field.value);
        submissionData.append('report_date', formData.report_date);
        submissionData.append('notes', formData.notes);
        formData.students.forEach(s => submissionData.append('student_ids', s.value));
        if (formData.report_photo) {
            submissionData.append('report_photo', formData.report_photo);
        }

        await onSubmit(submissionData);
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={report ? 'Edit Olympiad Report' : 'Add Olympiad Report'}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <AsyncSelect
                    cacheOptions
                    loadOptions={loadOlympiadFields}
                    value={formData.olympiad_field}
                    onChange={value => handleSelectChange('olympiad_field', value)}
                    placeholder="Select Olympiad Field..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    required
                />
                <AsyncSelect
                    isMulti
                    cacheOptions
                    loadOptions={loadStudents}
                    value={formData.students}
                    onChange={value => handleSelectChange('students', value)}
                    placeholder="Select Students..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                />
                <input type="date" name="report_date" value={formData.report_date} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-full" required />
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-full" />
                <div>
                    <label htmlFor="report_photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Photo</label>
                    {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-40 h-40 object-cover rounded-md" />}
                    <input type="file" name="report_photo" id="report_photo" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default OlympiadReportForm;