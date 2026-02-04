import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CLASSES_API_URL = `${API_BASE_URL}/api/v1/classes/`;
const STUDENTS_API_URL = `${API_BASE_URL}/api/v1/students/`;
const TEACHERS_API_URL = `${API_BASE_URL}/api/v1/teachers/?type=putra`;
const SURAHS_API_URL = `${API_BASE_URL}/api/v1/tahfidz-app/surahs/`;
const TARGETS_API_URL = `${API_BASE_URL}/api/v1/targets/`;
const TILAWAH_QUICK_CREATE_API_URL = `${API_BASE_URL}/api/v1/tahfidz-app/tilawah/quick-create/`;
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';
import customSelectStyles from '../common/CustomStyle';

const TAHSEEN_STATUS = [null, "Mumtaz", "Jayyid Jiddan", "Jayyid", "Maqbul", "Da'if"];
const STUDENT_STATUS = ["Hadir", "Sakit", "Telat", "Izin", "Alpa"];

const getApiService = (authHeader) => ({
    get: async (url) => {
        const response = await fetch(url, { headers: { ...authHeader() } });
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return response.json();
    },
    post: async (url, data) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                ...authHeader() },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(`Server error: ${response.status} ${await response.text()}`);
        }
        return response.json();
    },
});

const TilawahQuickCreatePage = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [surahs, setSurahs] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentInputs, setStudentInputs] = useState({});
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [targetHalaman, setTargetHalaman] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [pendampingIds, setPendampingIds] = useState([]);


    const { authHeader } = useAuth();
    const apiService = useMemo(() => getApiService(authHeader), [authHeader]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [classesData, teachersData, surahsData] = await Promise.all([
                    apiService.get(CLASSES_API_URL),
                    apiService.get(TEACHERS_API_URL),
                    apiService.get(SURAHS_API_URL)
                ]);
                setClasses(classesData.results || classesData);
                setTeachers(teachersData.results || teachersData);
                setSurahs(surahsData);
            } catch (err) {
                setError('Failed to load initial data. Please refresh the page.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [apiService]);

    const handleClassChange = useCallback(async (classId) => {
        setSelectedClass(classId);
        if (!classId) {
            setStudents([]); setStudentInputs({});
            return;
        }
        setIsLoading(true);
        try {
            const data = await apiService.get(`${STUDENTS_API_URL}?class_id=${classId}`);
            const fetchedStudents = data.results || [];
            setStudents(fetchedStudents);

            // Check for target on the selected date and apply it
            const targetResponse = await apiService.get(`${TARGETS_API_URL}?date=${selectedDate}`);
            let targetSurahId = 1;
            let targetAyat = 1;

            if (targetResponse.results && targetResponse.results.length > 0) {
                const targetData = targetResponse.results[0];
                const targetSurah = surahs.find(s => s.id === targetData.nomor_surat);
                if (targetSurah) {
                    targetSurahId = targetSurah.id;
                    targetAyat = targetData.ayat;
                }
            }

            const initialInputs = fetchedStudents.reduce((acc, student) => {
                acc[student.id] = {
                    kehadiran: 'Hadir',
                    halaman: targetHalaman || '',
                    surat: targetSurahId,
                    ayat: targetAyat,
                    kelancaran: null,
                    tajwid: null,
                };
                return acc;
            }, {});
            setStudentInputs(initialInputs);

        } catch (err) {
            setError('Failed to fetch students for the selected class.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiService, selectedDate, surahs, targetHalaman]);

    useEffect(() => {
        const fetchTargetForDate = async () => {
            if (!selectedDate || surahs.length === 0 || students.length === 0) return;

            try {
                const data = await apiService.get(`${TARGETS_API_URL}?date=${selectedDate}`);
                if (data.results && data.results.length > 0) {
                    const targetData = data.results[0];
                    const targetSurah = surahs.find(s => s.id === targetData.nomor_surat);

                    if (targetSurah) {
                        setStudentInputs(prevInputs => {
                            const newInputs = { ...prevInputs };
                            students.forEach(student => {
                                if (newInputs[student.id]) {
                                    newInputs[student.id].surat = targetSurah.id;
                                    newInputs[student.id].ayat = targetData.ayat || '';
                                }
                            });
                            return newInputs;
                        });
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch target for date ${selectedDate}:`, err);
            }
        };
        fetchTargetForDate();
    }, [selectedDate, surahs, students, apiService]);

    useEffect(() => {
        if (targetHalaman && students.length > 0) {
            setStudentInputs(prevInputs => {
                const newInputs = { ...prevInputs };
                students.forEach(student => {
                    if (newInputs[student.id]) {
                        newInputs[student.id].halaman = targetHalaman;
                    }
                });
                return newInputs;
            });
        }
    }, [targetHalaman, students]);

    const handleStudentInputChange = (studentId, field, value) => {
        setStudentInputs(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        const formData = new FormData(e.target);
        const payload = {
            tanggal: selectedDate,            
            catatan: formData.get('catatan'),
            pendamping_ids: formData.getAll('pendamping_ids'),           
            student_data: students.map(student => ({
                santri_id: student.id,
                ...studentInputs[student.id]
            }))
        };

        try {
            const result = await apiService.post(TILAWAH_QUICK_CREATE_API_URL, payload);
            setSuccessMessage(`Successfully created ${result.created_count} Tilawah records.`);
            setStudents([]);
            setStudentInputs({});
            setTargetHalaman('');
            setSelectedClass('');
            e.target.reset();
        } catch (err) {
            setError(`Submission failed: ${err.message}`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadOptions = async (apiUrl, inputValue, mapping) => {
        try {
            const searchParam = inputValue ? `?search=${inputValue}` : '';
            const response = await fetch(`${apiUrl}${searchParam}`, { headers: { ...authHeader() } });
            const data = await response.json();
            return (data.results || data || []).map(mapping);
        } catch (error) {
            console.error("Error loading options:", error);
            return [];
        }
    };

    const debouncedLoadTeachers = debounce((inputValue, callback) => {
        loadOptions(TEACHERS_API_URL, inputValue, t => ({ value: t.id, label: t.teacher_name })).then(callback);
    }, 300);

    const handleSelectChange = (name, options) => {
        if (name === 'pendamping_ids') {
            setPendampingIds(options);
        }
        // Handle other select changes if needed
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Quick Create Tilawah</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-white">Bulk create Tilawah records for a class.</p>
            </header>

            <main className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                            <input type="date" name="tanggal" id="tanggal" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Kelas</label>
                            <select name="class_id" id="class_id" value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white">
                                <option value="">--- Pilih Kelas ---</option>
                                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="pendamping_ids" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Pendamping </label>
                            <AsyncSelect
                                isMulti
                                id="pendamping_ids"
                                name="pendamping_ids"
                                cacheOptions
                                defaultOptions
                                value={pendampingIds}
                                loadOptions={debouncedLoadTeachers}
                                onChange={options => handleSelectChange('pendamping_ids', options)}
                                isDisabled={isSubmitting}
                                styles={customSelectStyles}
                            />
                            <p className='text-xs'>Bisa pilih lebih dari satu</p>
                        </div>
                        <div className="lg:col-span-3">
                            <label htmlFor="target_halaman" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Halaman</label>
                            <input type="number" name="target_halaman" id="target_halaman" value={targetHalaman} onChange={(e) => setTargetHalaman(e.target.value)} placeholder="Isi untuk mengisi semua halaman santri" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div className="lg:col-span-3">
                            <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catatan</label>
                            <input type="text" name="catatan" id="catatan" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-gray-900 dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>

                    {isLoading && <div className="flex justify-center items-center p-4"><LoadingSpinner /> <span className="ml-2">Loading...</span></div>}

                    {students.length > 0 && Object.keys(studentInputs).length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Santri</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kehadiran</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Halaman</th>
                                        {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Surat</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ayat</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kelancaran</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tajwid</th> */}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {students.map((student, index) => (
                                        <tr key={student.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {index + 1}. {student.student_name}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <select name={`kehadiran_${student.id}`} value={studentInputs[student.id]?.kehadiran || 'Hadir'} onChange={(e) => handleStudentInputChange(student.id, 'kehadiran', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm text-gray-900 dark:bg-gray-700 dark:text-white">
                                                    {STUDENT_STATUS.map(status => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <input type="number" name={`halaman_${student.id}`} value={studentInputs[student.id]?.halaman || ''} onChange={(e) => handleStudentInputChange(student.id, 'halaman', e.target.value)} placeholder="Halaman" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-25 text-sm text-center text-gray-900 dark:bg-gray-700 dark:text-white" />
                                            </td>
                                            {/* <td className="px-4 py-2 whitespace-nowrap">
                                                <input type="hidden" name={`surah_${student.id}`} value={studentInputs[student.id]?.surat || 1}/>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <input type="hidden" name={`ayat_${student.id}`} value={studentInputs[student.id]?.ayat || 1}/>
                                            </td> */}
                                            {/* <td className="px-4 py-2 whitespace-nowrap">
                                                <select name={`surah_${student.id}`} value={studentInputs[student.id]?.surat || 1} onChange={(e) => handleStudentInputChange(student.id, 'surat', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm text-gray-900 dark:bg-gray-700 dark:text-white">
                                                    <option value="">Pilih Surah</option>
                                                    {surahs.map(surah => <option key={surah.id} value={surah.id}>{surah.id}. {surah.name}</option>)}
                                                </select>
                                            </td> */}
                                            {/* <td className="px-4 py-2 whitespace-nowrap">
                                                <input type="number" name={`ayat_${student.id}`} value={studentInputs[student.id]?.ayat || 1} onChange={(e) => handleStudentInputChange(student.id, 'ayat', e.target.value)} placeholder="Ayat" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-20 text-sm text-center text-gray-900 dark:bg-gray-700 dark:text-white" />
                                            </td> */}
                                            {/* <td className="px-4 py-2 whitespace-nowrap">
                                                <select name={`kelancaran_${student.id}`} value={studentInputs[student.id]?.kelancaran || ''} onChange={(e) => handleStudentInputChange(student.id, 'kelancaran', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm text-gray-900 dark:bg-gray-700 dark:text-white">
                                                    {TAHSEEN_STATUS.map((status, i) => <option key={i} value={status || ''}>{status || '--- Kelancaran ---'}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <select name={`tajwid_${student.id}`} value={studentInputs[student.id]?.tajwid || ''} onChange={(e) => handleStudentInputChange(student.id, 'tajwid', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm text-gray-900 dark:bg-gray-700 dark:text-white">
                                                    {TAHSEEN_STATUS.map((status, i) => <option key={i} value={status || ''}>{status || '--- Tajwid ---'}</option>)}
                                                </select>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {students.length > 0 && (
                        <div className="mt-6 flex justify-end">
                            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSubmitting}>
                                {isSubmitting ? <LoadingSpinner /> : 'Submit All'}
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </>
    );
};

export default TilawahQuickCreatePage;