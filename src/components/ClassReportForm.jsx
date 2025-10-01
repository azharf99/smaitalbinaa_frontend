import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';

const STATUS_CHOICES = [
    { value: 'Hadir', label: 'Hadir' },
    { value: 'Izin', label: 'Izin' },
    { value: 'Sakit', label: 'Sakit' },
    { value: 'Tanpa Keterangan', label: 'Tanpa Keterangan' },
    { value: 'Off', label: 'Off' },
];

const GENDER_CHOICES = [
    { value: 'Putra', label: 'Putra' },
    { value: 'Putri', label: 'Putri' },
];

const ClassReportForm = ({ isOpen, onClose, onSubmit, item, apiService, isSubmitting }) => {
    const [formData, setFormData] = useState({
        report_date: '',
        schedule_id: null,
        status: 'Hadir',
        duty: '',
        notes: '',
        subtitute_teacher_id: null,
        reporter_id: null,
        is_submitted: false,
        is_complete: false,
        semester: '',
        academic_year: '',
        type: 'Putra',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                report_date: item.report_date || '',
                schedule_id: item.schedule ? { value: item.schedule.id, label: `${item.schedule.schedule_course} - ${item.schedule.schedule_class} (${item.schedule.schedule_day})` } : null,
                status: item.status || 'Hadir',
                duty: item.duty || '',
                notes: item.notes || '',
                subtitute_teacher_id: item.subtitute_teacher ? { value: item.subtitute_teacher.id, label: item.subtitute_teacher.teacher_name } : null,
                reporter_id: item.reporter ? { value: item.reporter.id, label: item.reporter.teacher_name } : null,
                is_submitted: item.is_submitted || false,
                is_complete: item.is_complete || false,
                semester: item.semester || '',
                academic_year: item.academic_year || '',
                type: item.type || 'Putra',
            });
        } else {
            // Reset form for new entry
            setFormData({ report_date: '', schedule_id: null, status: 'Hadir', duty: '', notes: '', subtitute_teacher_id: null, reporter_id: null, is_submitted: false, is_complete: false, semester: '', academic_year: '', type: 'Putra' });
        }
    }, [item]);

    const loadOptions = async (endpoint, search, mapFn) => {
        try {
            const response = await apiService.get(endpoint, { params: { search } });
            return (response.data.results || response.data).map(mapFn);
        } catch (error) {
            console.error(`Error loading ${endpoint}:`, error);
            return [];
        }
    };

    const debouncedLoad = (endpoint, mapFn) => debounce((inputValue, callback) => {
        loadOptions(endpoint, inputValue, mapFn).then(callback);
    }, 300);

    const loadSchedules = debouncedLoad('schedules', s => ({ value: s.id, label: `${s.schedule_course.course.name} | ${s.schedule_course.teacher.teacher_name} - ${s.schedule_class.class_name} (${s.schedule_day})` }));
    const loadTeachers = debouncedLoad('teachers', t => ({ value: t.id, label: t.teacher_name }));

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSelectChange = (name, selected) => {
        setFormData(prev => ({ ...prev, [name]: selected }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            schedule_id: formData.schedule_id?.value,
            subtitute_teacher_id: formData.subtitute_teacher_id?.value,
            reporter_id: formData.reporter_id?.value,
        };
        onSubmit(submissionData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Class Report' : 'Add Class Report'}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-style">Report Date</label>
                        <input type="date" name="report_date" value={formData.report_date} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                    <div>
                        <label className="label-style">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                            {STATUS_CHOICES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="label-style">Schedule</label>
                    <AsyncSelect cacheOptions defaultOptions loadOptions={loadSchedules} value={formData.schedule_id} onChange={val => handleSelectChange('schedule_id', val)} placeholder="Select Schedule" className="react-select-container" classNamePrefix="react-select" required />
                </div>
                <div>
                    <label className="label-style">Substitute Teacher (Optional)</label>
                    <AsyncSelect cacheOptions isClearable defaultOptions loadOptions={loadTeachers} value={formData.subtitute_teacher_id} onChange={val => handleSelectChange('subtitute_teacher_id', val)} placeholder="Select Substitute" className="react-select-container" classNamePrefix="react-select" />
                </div>
                <div>
                    <label className="label-style">Reporter (Optional)</label>
                    <AsyncSelect cacheOptions isClearable defaultOptions loadOptions={loadTeachers} value={formData.reporter_id} onChange={val => handleSelectChange('reporter_id', val)} placeholder="Select Reporter" className="react-select-container" classNamePrefix="react-select" />
                </div>
                <div>
                    <label className="label-style">Duty (Optional)</label>
                    <textarea name="duty" value={formData.duty} onChange={handleChange} placeholder="Duty information" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-full" />
                </div>
                <div>
                    <label className="label-style">Notes (Optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    <input type="text" name="academic_year" placeholder="Academic Year" value={formData.academic_year} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    <select name="type" value={formData.type} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                        {GENDER_CHOICES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <input type="checkbox" name="is_submitted" id="is_submitted" checked={formData.is_submitted} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="is_submitted" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Submitted</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="is_complete" id="is_complete" checked={formData.is_complete} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="is_complete" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Complete</label>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default ClassReportForm;