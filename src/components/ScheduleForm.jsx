import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';

const SCHEDULE_WEEKDAYS = [
    { value: 'Senin', label: 'Senin' },
    { value: 'Selasa', label: 'Selasa' },
    { value: 'Rabu', label: 'Rabu' },
    { value: 'Kamis', label: 'Kamis' },
    { value: 'Sabtu', label: 'Sabtu' },
    { value: 'Ahad', label: 'Ahad' },
];

const ScheduleForm = ({ isOpen, onClose, onSubmit, item, apiService, isSubmitting }) => {
    const [formData, setFormData] = useState({
        schedule_day: '',
        schedule_time_id: null,
        schedule_course_id: null,
        schedule_class_id: null,
        semester: '',
        academic_year: '',
        type: 'Putra',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                schedule_day: item.schedule_day || '',
                schedule_time_id: item.schedule_time ? { value: item.schedule_time.id, label: `${item.schedule_time.number} (${item.schedule_time.time_start} - ${item.schedule_time.time_end})` } : null,
                schedule_course_id: item.schedule_course ? { value: item.schedule_course.id, label: item.schedule_course.course.name } : null,
                schedule_class_id: item.schedule_class ? { value: item.schedule_class.id, label: item.schedule_class.class_name } : null,
                semester: item.semester || '',
                academic_year: item.academic_year || '',
                type: item.type || 'Putra',
            });
        } else {
            setFormData({ schedule_day: '', schedule_time_id: null, schedule_course_id: null, schedule_class_id: null, semester: '', academic_year: '', type: 'Putra' });
        }
    }, [item]);

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

    const loadPeriods = debouncedLoad('periods', item => ({ value: item.id, label: `${item.number} (${item.time_start} - ${item.time_end})` }));
    const loadCourses = debouncedLoad('courses', item => ({ value: item.id, label: item.course.name }));
    const loadClasses = debouncedLoad('classes', item => ({ value: item.id, label: item.class_name }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, selected) => {
        setFormData(prev => ({ ...prev, [name]: selected }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            schedule_time_id: formData.schedule_time_id?.value,
            schedule_course_id: formData.schedule_course_id?.value,
            schedule_class_id: formData.schedule_class_id?.value,
        };
        onSubmit(submissionData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Schedule' : 'Add Schedule'}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="schedule_day" className="label-style">Day</label>
                        <select name="schedule_day" id="schedule_day" value={formData.schedule_day} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                            <option value="">Select Day</option>
                            {SCHEDULE_WEEKDAYS.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="schedule_time_id" className="label-style">Time</label>
                        <AsyncSelect cacheOptions defaultOptions loadOptions={loadPeriods} value={formData.schedule_time_id} onChange={val => handleSelectChange('schedule_time_id', val)} placeholder="Select Period" className="react-select-container" classNamePrefix="react-select" />
                    </div>
                </div>
                <div>
                    <label htmlFor="schedule_course_id" className="label-style">Course</label>
                    <AsyncSelect cacheOptions defaultOptions loadOptions={loadCourses} value={formData.schedule_course_id} onChange={val => handleSelectChange('schedule_course_id', val)} placeholder="Select Course" className="react-select-container" classNamePrefix="react-select" />
                </div>
                <div>
                    <label htmlFor="schedule_class_id" className="label-style">Class</label>
                    <AsyncSelect cacheOptions defaultOptions loadOptions={loadClasses} value={formData.schedule_class_id} onChange={val => handleSelectChange('schedule_class_id', val)} placeholder="Select Class" className="react-select-container" classNamePrefix="react-select" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="semester" className="label-style">Semester</label>
                        <input type="text" name="semester" id="semester" value={formData.semester} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    </div>
                    <div>
                        <label htmlFor="academic_year" className="label-style">Academic Year</label>
                        <input type="text" name="academic_year" id="academic_year" value={formData.academic_year} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    </div>
                    <div>
                        <label htmlFor="type" className="label-style">Type</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                            <option value="Putra">Putra</option>
                            <option value="Putri">Putri</option>
                        </select>
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

export default ScheduleForm;