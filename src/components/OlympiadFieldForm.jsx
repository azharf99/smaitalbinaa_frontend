import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../context/AuthContext';
import AsyncSelect from 'react-select/async';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const OlympiadFieldForm = ({ isOpen, onClose, onSubmit, field, apiService, isSubmitting }) => {
    const { user } = useAuth(); // This is not used, can be removed if not needed elsewhere.
    const [formData, setFormData] = useState({
        field_name: '',
        teacher_id: null,
        schedule: '',
        member_ids: [],
        type: 'KSM',
    });
    const [teacherDefault, setTeacherDefault] = useState(null);
    const [membersDefault, setMembersDefault] = useState([]);

    useEffect(() => {
        if (field) {
            setFormData({
                field_name: field.field_name || '',
                teacher_id: field.teacher?.id || null,
                schedule: field.schedule || '',
                member_ids: field.members?.map(m => m.id) || [],
                type: field.type || 'KSM',
            });
            if (field.teacher) {
                setTeacherDefault({ value: field.teacher.id, label: field.teacher.teacher_name });
            } else {
                setTeacherDefault(null);
            }
            if (field.members) {
                setMembersDefault(field.members.map(m => ({ value: m.id, label: m.student_name })));
            } else {
                setMembersDefault([]);
            }
        } else {
            setFormData({
                field_name: '',
                teacher_id: null,
                schedule: '',
                member_ids: [],
                type: 'KSM',
            });
            setTeacherDefault(null);
            setMembersDefault([]);
        }
    }, [field, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTeacherChange = (selectedOption) => {
        setTeacherDefault(selectedOption);
        setFormData(prev => ({ ...prev, teacher_id: selectedOption ? selectedOption.value : null }));
    };

    const handleMembersChange = (selectedOptions) => {
        setMembersDefault(selectedOptions);
        setFormData(prev => ({ ...prev, member_ids: selectedOptions ? selectedOptions.map(o => o.value) : [] }));
    };

    const loadTeachers = (inputValue) =>
        apiService.get('teachers', { search: inputValue, page_size: 10 })
            .then(res => res.data.results.map(teacher => ({ value: teacher.id, label: teacher.teacher_name })));

    const loadStudents = (inputValue) =>
        apiService.get('students', { search: inputValue, page_size: 10 })
            .then(res => res.data.results.map(student => ({ value: student.id, label: student.student_name })));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={field ? 'Edit Olympiad Field' : 'Add Olympiad Field'}>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="field_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field Name</label>
                    <input type="text" name="field_name" id="field_name" value={formData.field_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teacher</label>
                    <AsyncSelect cacheOptions defaultOptions loadOptions={loadTeachers} value={teacherDefault} onChange={handleTeacherChange} isClearable />
                </div>
                <div className="mb-4">
                    <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</label>
                    <textarea name="schedule" id="schedule" value={formData.schedule} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="mb-4">
                    <label htmlFor="member_ids" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Members</label>
                    <AsyncSelect isMulti cacheOptions defaultOptions loadOptions={loadStudents} value={membersDefault} onChange={handleMembersChange} />
                </div>
                <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                        <option value="KSM">KSM</option>
                        <option value="OSN">OSN</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button type="button" onClick={onClose} className="btn-secondary mr-2" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner /> : 'Submit'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default OlympiadFieldForm;