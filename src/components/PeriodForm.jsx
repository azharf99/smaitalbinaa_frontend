import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

const PeriodForm = ({ isOpen, onClose, onSubmit, item, isSubmitting }) => {
    const [formData, setFormData] = useState({
        number: '',
        time_start: '',
        short_time_start: '',
        time_end: '',
        short_time_end: '',
        type: 'Putra',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                number: item.number || '',
                time_start: item.time_start || '',
                short_time_start: item.short_time_start || '',
                time_end: item.time_end || '',
                short_time_end: item.short_time_end || '',
                type: item.type || 'Putra',
            });
        } else {
            setFormData({ number: '', time_start: '', short_time_start: '', time_end: '', short_time_end: '', type: 'Putra' });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Period' : 'Add Period'}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number</label>
                        <input type="number" name="number" id="number" value={formData.number} onChange={handleChange} className="px-3 py-2 blcok w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className="px-3 py-2 blcok w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                            <option value="Putra">Putra</option>
                            <option value="putri">Putri</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="time_start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Start</label>
                        <input type="time" name="time_start" id="time_start" value={formData.time_start} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                    <div>
                        <label htmlFor="time_end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time End</label>
                        <input type="time" name="time_end" id="time_end" value={formData.time_end} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                    <div>
                        <label htmlFor="short_time_start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Time Start</label>
                        <input type="time" name="short_time_start" id="short_time_start" value={formData.short_time_start} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                    <div>
                        <label htmlFor="short_time_end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Time End</label>
                        <input type="time" name="short_time_end" id="short_time_end" value={formData.short_time_end} onChange={handleChange} className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" required />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default PeriodForm;