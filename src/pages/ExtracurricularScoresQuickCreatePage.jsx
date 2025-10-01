import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SCORE_CHOICES = ['A', 'B', 'C', 'D', 'E'];

const ExtracurricularScoresQuickCreatePage = () => {
    const { authHeader } = useAuth();
    const [extracurriculars, setExtracurriculars] = useState([]);
    const [selectedExtracurricular, setSelectedExtracurricular] = useState(null);
    const [selectedExtracurricularDetails, setSelectedExtracurricularDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch extracurriculars on component mount
    useEffect(() => {
        const fetchExtracurriculars = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/extracurriculars/`, { headers: { ...authHeader() } });
                const data = await response.json();
                setExtracurriculars(data.results || data);
            } catch (error) {
                console.error('Error fetching extracurriculars:', error);
                toast.error('Gagal memuat data ekstrakurikuler.');
            }
        };
        fetchExtracurriculars();
    }, [authHeader]);

    // Fetch members of selected extracurricular and their existing scores
    useEffect(() => {
        if (!selectedExtracurricular) {
            setStudents([]);
            setScores({});
            setSelectedExtracurricularDetails(null);
            return;
        }

        const fetchMembersAndScores = async () => {
            setLoading(true);
            try {
                // Fetch extracurricular with members
                const exkulRes = await fetch(`${API_BASE_URL}/api/v1/extracurriculars/?id=${selectedExtracurricular.value}`, { headers: { ...authHeader() } });
                const exkulData = await exkulRes.json();
                const exkul = (exkulData.results || [])[0];
                const members = exkul?.member_details || [];
                setSelectedExtracurricularDetails(exkul || null);
                setStudents(members);

                // Fetch existing scores for the selected extracurricular
                const scoresResponse = await fetch(`${API_BASE_URL}/api/v1/extracurricular-scores/?extracurricular_id=${selectedExtracurricular.value}`, { headers: { ...authHeader() } });
                const existingScoresData = await scoresResponse.json();
                const existingScores = (existingScoresData.results || existingScoresData || []).reduce((acc, score) => {
                    if (score?.student?.id) {
                        acc[score.student.id] = { score: score.score, scoreId: score.id };
                    }
                    return acc;
                }, {});

                // Initialize scores state for members
                const initialScores = members.reduce((acc, member) => {
                    acc[member.id] = {
                        score: existingScores[member.id]?.score || 'B',
                        scoreId: existingScores[member.id]?.scoreId || null,
                    };
                    return acc;
                }, {});
                setScores(initialScores);
            } catch (error) {
                console.error('Error fetching members and scores:', error);
                toast.error('Gagal memuat anggota dan nilai.');
            } finally {
                setLoading(false);
            }
        };

        fetchMembersAndScores();
    }, [selectedExtracurricular, authHeader]);

    const handleScoreChange = (studentId, newScore) => {
        setScores(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], score: newScore },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const promises = Object.entries(scores).map(([studentId, { score, scoreId }]) => {
            const url = scoreId
                ? `${API_BASE_URL}/api/v1/extracurricular-scores/${scoreId}/`
                : `${API_BASE_URL}/api/v1/extracurricular-scores/`;

            const method = scoreId ? 'PATCH' : 'POST';

            const body = {
                student_id: studentId,
                extracurricular_id: selectedExtracurricular.value,
                score: score,
            };

            return fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify(body),
            });
        });

        try {
            const responses = await Promise.all(promises);
            const hasError = responses.some(res => !res.ok);

            if (hasError) {
                toast.error('Beberapa nilai gagal disimpan. Silakan coba lagi.');
            } else {
                toast.success('Semua nilai berhasil disimpan!');
            }
        } catch (error) {
            console.error("Error submitting scores:", error);
            toast.error('Terjadi kesalahan saat menyimpan nilai.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const extracurricularOptions = extracurriculars.map(e => ({ value: e.id, label: e.name }));

    // Custom styles for react-select to support light/dark readability
    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const selectStyles = useMemo(() => ({
        control: (base, state) => ({
            ...base,
            backgroundColor: isDarkMode ? '#374151' : '#ffffff', // gray-700 : white
            borderColor: state.isFocused ? '#2563eb' : (isDarkMode ? '#4b5563' : '#d1d5db'), // blue-600 : gray-500/300
            boxShadow: state.isFocused ? '0 0 0 2px rgba(37,99,235,0.35)' : base.boxShadow,
            '&:hover': { borderColor: '#2563eb' },
            color: isDarkMode ? '#ffffff' : '#111827', // white : gray-900
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? '#111827' : '#ffffff', // gray-900 : white
            color: isDarkMode ? '#ffffff' : '#111827',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#2563eb' // blue-600
                : state.isFocused
                    ? (isDarkMode ? '#1f2937' : '#e5e7eb') // gray-800 : gray-200
                    : (isDarkMode ? '#111827' : '#ffffff'), // gray-900 : white
            color: state.isSelected ? '#ffffff' : (isDarkMode ? '#ffffff' : '#111827'),
        }),
        singleValue: (base) => ({
            ...base,
            color: isDarkMode ? '#ffffff' : '#111827',
        }),
        input: (base) => ({
            ...base,
            color: isDarkMode ? '#ffffff' : '#111827',
        }),
        placeholder: (base) => ({
            ...base,
            color: isDarkMode ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 50,
        }),
    }), [isDarkMode]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Input Cepat Nilai Ekstrakurikuler</h1>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 gap-4">
                    <Select
                        options={extracurricularOptions}
                        onChange={setSelectedExtracurricular}
                        value={selectedExtracurricular}
                        isDisabled={loading || isSubmitting}
                        placeholder="Pilih Ekstrakurikuler..."
                        className="react-select-container text-gray-900 dark:text-white"
                        classNamePrefix="react-select"
                        styles={selectStyles}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    />
                </div>
                {selectedExtracurricularDetails && (
                    <div className="mt-6 flex items-center gap-4">
                        {selectedExtracurricularDetails.logo && (
                            <img
                                src={selectedExtracurricularDetails.logo}
                                alt={selectedExtracurricularDetails.name}
                                className="w-16 h-16 rounded object-cover shadow"
                            />
                        )}
                        <div className="flex-1">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedExtracurricularDetails.name}</div>
                            {Array.isArray(selectedExtracurricularDetails.teacher_details) && selectedExtracurricularDetails.teacher_details.length > 0 && (
                                <div className="text-sm text-gray-900 dark:text-white">
                                    Pembina: {selectedExtracurricularDetails.teacher_details.map(t => t.teacher_name).join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
            ) : students.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Nama Santri</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {students.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{student.student_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={scores[student.id]?.score || 'B'}
                                                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                    disabled={isSubmitting || loading}
                                                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {SCORE_CHOICES.map(choice => <option key={choice} value={choice}>{choice}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting ? (<><LoadingSpinner /> <span>Menyimpan...</span></>) : 'Simpan Semua Nilai'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ExtracurricularScoresQuickCreatePage;