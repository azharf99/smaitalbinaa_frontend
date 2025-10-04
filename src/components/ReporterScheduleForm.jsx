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

const SCHEDULE_TIME = [
    { value: '1', label: 'Jam ke-1' },
    { value: '2', label: 'Jam ke-2' },
    { value: '3', label: 'Jam ke-3' },
    { value: '4', label: 'Jam ke-4' },
    { value: '5', label: 'Jam ke-5' },
    { value: '6', label: 'Jam ke-6' },
    { value: '7', label: 'Jam ke-7' },
    { value: '8', label: 'Jam ke-8' },
    { value: '9', label: 'Jam ke-9' },
];

const ReporterScheduleForm = ({ isOpen, onClose, onSubmit, item, apiService, isSubmitting }) => {
    const [formData, setFormData] = useState({
        schedule_day: '',
        schedule_time: '',
        reporter_id: null,
        time_start: '',
        time_end: '',
        semester: '',
        academic_year: '',
        type: 'putra',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                schedule_day: item.schedule_day || '',
                schedule_time: item.schedule_time || '',
                reporter_id: item.reporter ? { value: item.reporter.id, label: item.reporter.teacher_name } : null,
                time_start: item.time_start || '',
                time_end: item.time_end || '',
                semester: item.semester || '',
                academic_year: item.academic_year || '',
                type: item.type || 'putra',
            });
        } else {
            setFormData({ schedule_day: '', schedule_time: '', reporter_id: null, time_start: '', time_end: '', semester: '', academic_year: '', type: 'putra' });
        }
    }, [item]);

    const loadTeachers = debounce((inputValue, callback) => {
        apiService.get('teachers', { search: inputValue })
            .then(response => callback((response.data.results || response.data).map(t => ({ value: t.id, label: t.teacher_name }))))
            .catch(() => callback([]));
    }, 300);

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
            reporter_id: formData.reporter_id?.value,
        };
        onSubmit(submissionData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Reporter Schedule' : 'Add Reporter Schedule'}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="schedule_day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day</label>
                        <select name="schedule_day" id="schedule_day" value={formData.schedule_day} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                            <option value="">Select Day</option>
                            {SCHEDULE_WEEKDAYS.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="schedule_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                        <select name="schedule_time" id="schedule_time" value={formData.schedule_time} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                            <option value="">Select Time</option>
                            {SCHEDULE_TIME.map(time => <option key={time.value} value={time.value}>{time.label}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="reporter_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reporter</label>
                    <AsyncSelect cacheOptions defaultOptions loadOptions={loadTeachers} value={formData.reporter_id} onChange={val => handleSelectChange('reporter_id', val)} placeholder="Select Reporter" className="react-select-container" classNamePrefix="react-select" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="time_start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Start</label>
                        <input type="time" name="time_start" id="time_start" value={formData.time_start} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    </div>
                    <div>
                        <label htmlFor="time_end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time End</label>
                        <input type="time" name="time_end" id="time_end" value={formData.time_end} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    <input type="text" name="academic_year" placeholder="Academic Year" value={formData.academic_year} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    <select name="type" value={formData.type} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                        <option value="putra">Putra</option>
                        <option value="putri">Putri</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default ReporterScheduleForm;