import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;
const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;
const PROJECTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/student-projects/`;
const TEAMS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/student-project-teams/`;

export const useDropdownData = () => {
    const { authHeader } = useAuth();
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const [studentsRes, teachersRes, projectsRes, teamsRes] = await Promise.all([
                fetch(STUDENTS_API_URL, { headers: { ...authHeader() } }),
                fetch(TEACHERS_API_URL, { headers: { ...authHeader() } }),
                fetch(PROJECTS_API_URL, { headers: { ...authHeader() } }),
                fetch(TEAMS_API_URL, { headers: { ...authHeader() } })
            ]);

            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                const studentsOptions = (studentsData.results || studentsData).map(student => ({
                    value: student.id,
                    label: student.student_name,
                    ...student
                }));
                setStudents(studentsOptions);
            }

            if (teachersRes.ok) {
                const teachersData = await teachersRes.json();
                const teachersOptions = (teachersData.results || teachersData).map(teacher => ({
                    value: teacher.id,
                    label: teacher.teacher_name,
                    ...teacher
                }));
                setTeachers(teachersOptions);
            }

            if (projectsRes.ok) {
                const projectsData = await projectsRes.json();
                const projectsOptions = (projectsData.results || projectsData).map(project => ({
                    value: project.id,
                    label: project.project_name,
                    ...project
                }));
                setProjects(projectsOptions);
            }

            if (teamsRes.ok) {
                const teamsData = await teamsRes.json();
                const teamsOptions = (teamsData.results || teamsData).map(team => ({
                    value: team.id,
                    label: `Team ${team.id} - ${team.team_leader?.student_name || 'No Leader'}`,
                    ...team
                }));
                setTeams(teamsOptions);
            }
        } catch (err) {
            setError('Failed to load dropdown data');
            console.error('Error fetching dropdown data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [authHeader]);

    return {
        students,
        teachers,
        projects,
        teams,
        isLoading,
        error,
        refetch: fetchData
    };
};
