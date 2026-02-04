import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const STUDENTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/students/`;
const TEACHERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/`;
const PROJECTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/student-projects/`;
const TEAMS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/student-project-teams/`;
const EXTRACURRICULARS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/extracurriculars/`;


export const useDropdownData = (all=false) => {
    const { authHeader } = useAuth();
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [extracurriculars, setExtracurriculars] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null); 
        
        try {
            const [studentsRes, teachersRes, extracurricularsRes, projectsRes, teamsRes] = await Promise.all([
                fetch(STUDENTS_API_URL+(all ? '?all=true' : ''), { headers: { ...authHeader() } }),
                fetch(TEACHERS_API_URL+'?type=putra', { headers: { ...authHeader() } }),
                fetch(EXTRACURRICULARS_API_URL+(all ? '?all=true' : ''), { headers: { ...authHeader() } }),
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

            if (extracurricularsRes.ok) {
                const extracurricularsData = await extracurricularsRes.json();
                const extracurricularsOptions = (extracurricularsData.results || extracurricularsData).map(extracurricular => ({
                    value: extracurricular.id,
                    label: extracurricular.name,
                    ...extracurricular
                }));
                setExtracurriculars(extracurricularsOptions);
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
        extracurriculars,
        teams,
        isLoading,
        error,
        refetch: fetchData
    };
};
