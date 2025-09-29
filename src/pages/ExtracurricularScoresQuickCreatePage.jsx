import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SCORE_CHOICES = ['A', 'B', 'C', 'D', 'E'];

const ExtracurricularScoresQuickCreatePage = () => {
    const { authHeader } = useAuth();
    const [classes, setClasses] = useState([]);
    const [extracurriculars, setExtracurriculars] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedExtracurricular, setSelectedExtracurricular] = useState(null);
    const [students, setStudents] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch classes and extracurriculars on component mount
    useEffect(() => {
        const fetchData = async (url, setter) => {
            try {
                const response = await fetch(url, { headers: { ...authHeader() } });
                const data = await response.json();
                setter(data.results || data);
            } catch (error) {
                console.error(`Error fetching data from ${url}:`, error);
                toast.error(`Gagal memuat data.`);
            }
        };
        fetchData(`${API_BASE_URL}/api/v1/classes/`, setClasses);
        fetchData(`${API_BASE_URL}/api/v1/extracurriculars/`, setExtracurriculars);
    }, [authHeader]);

    // Fetch students and their existing scores when class and extracurricular are selected
    useEffect(() => {
        if (!selectedClass || !selectedExtracurricular) {
            setStudents([]);
            setScores({});
            return;
        }

        const fetchStudentsAndScores = async () => {
            setLoading(true);
            try {
                // Fetch students in the selected class
                const studentsResponse = await fetch(`${API_BASE_URL}/api/v1/students/?class_id=${selectedClass.value}`, { headers: { ...authHeader() } });
                const studentData = await studentsResponse.json();
                const classStudents = studentData.results || [];
                setStudents(classStudents);

                // Fetch existing scores for these students and the selected extracurricular
                const scoresResponse = await fetch(`${API_BASE_URL}/api/v1/extracurricular-scores/?student__class_id=${selectedClass.value}&extracurricular_id=${selectedExtracurricular.value}`, { headers: { ...authHeader() } });
                const existingScoresData = await scoresResponse.json();
                const existingScores = (existingScoresData.results || []).reduce((acc, score) => {
                    acc[score.student.id] = { score: score.score, scoreId: score.id };
                    return acc;
                }, {});

                // Initialize scores state
                const initialScores = classStudents.reduce((acc, student) => {
                    acc[student.id] = {
                        score: existingScores[student.id]?.score || 'B', // Default to 'B'
                        scoreId: existingScores[student.id]?.scoreId || null,
                    };
                    return acc;
                }, {});
                setScores(initialScores);

            } catch (error) {
                console.error("Error fetching students and scores:", error);
                toast.error("Gagal memuat data santri dan nilai.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsAndScores();
    }, [selectedClass, selectedExtracurricular, authHeader]);

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

    const classOptions = classes.map(c => ({ value: c.id, label: c.class_name }));
    const extracurricularOptions = extracurriculars.map(e => ({ value: e.id, label: e.name }));

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Input Cepat Nilai Ekstrakurikuler</h1>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        options={classOptions}
                        onChange={setSelectedClass}
                        value={selectedClass}
                        placeholder="Pilih Kelas..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    <Select
                        options={extracurricularOptions}
                        onChange={setSelectedExtracurricular}
                        value={selectedExtracurricular}
                        placeholder="Pilih Ekstrakurikuler..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Santri</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nilai</th>
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
                                                    className="input-style"
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
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <LoadingSpinner /> : 'Simpan Semua Nilai'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ExtracurricularScoresQuickCreatePage;