import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const navLinkClasses = "flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700";
const activeNavLinkClasses = "bg-gray-300 font-bold dark:bg-gray-600";

export default function Layout({ children }) {
    const { theme, toggleTheme } = useTheme();    
    const { user, logout, isLoading, authHeader } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [displayName, setDisplayName] = useState('');

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (user) {
            const fetchTeacherName = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/teachers/?user=${user.user_id}`, {
                        headers: { ...authHeader() }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.results && data.results.length > 0) {
                            setDisplayName(data.results[0].teacher_name);
                        } else {
                            setDisplayName(user.username);
                        }
                    } else {
                        setDisplayName(user.username);
                    }
                } catch (error) {
                    setDisplayName(user.username);
                }
            };
            fetchTeacherName();
        }
    }, [user, authHeader]);

    return (
        <div className="relative md:flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={closeSidebar}></div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-md transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
                <div className="p-4 border-b dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">School System</h1>
                </div>
                <nav className="mt-4 px-2 overflow-y-auto h-screen" onClick={closeSidebar}>
                    <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end>Dashboard</NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Academic Calendar</NavLink>
                    <NavLink to="/achievements" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Achievements</NavLink>
                    <NavLink to="/alumni" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Alumni</NavLink>
                    <NavLink to="/news" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>News</NavLink>
                    <NavLink to="/blog-categories" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Blog Categories</NavLink>
                    <NavLink to="/students" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Students</NavLink>
                    <NavLink to="/classes" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Classes</NavLink>
                    <NavLink to="/teachers" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Teachers</NavLink>
                    <NavLink to="/subjects" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Subjects</NavLink>
                    <NavLink to="/courses" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Courses</NavLink>
                    <NavLink to="/extracurriculars" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Extracurriculars</NavLink>
                    <NavLink to="/extracurricular-scores" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Extracurricular Scores</NavLink>
                    <NavLink to="/extracurricular-scores-quick-create" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Extracurricular Scores Quick Create</NavLink>
                    <NavLink to="/extracurricular-reports" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Extracurricular Reports</NavLink>
                    <NavLink to="/tahfidz" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Tahfidz</NavLink>
                    <NavLink to="/tilawah" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Tilawah</NavLink>
                    <NavLink to="/private-lessons" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Private Lessons</NavLink>
                    <NavLink to="/private-subjects" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Private Subjects</NavLink>
                    <NavLink to="/private-groups" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Private Groups</NavLink>
                    <NavLink to="/tilawah-quick-create" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Tilawah Quick Create</NavLink>
                    <NavLink to="/targets" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Target Tilawah</NavLink>
                    {user?.is_superuser && (
                        <NavLink to="/users" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Users</NavLink>
                    )}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
                    <div className="container mx-auto px-4 sm:px-6 py-3">
                        <div className="flex md:hidden justify-between items-center">
                            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600" aria-label="Open sidebar">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">School System</Link>
                        </div>
                        <div className="flex justify-end items-center">
                            <button onClick={toggleTheme} className="mr-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                                {theme === 'light' ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                )}
                            </button>
                            {user && (
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-800 dark:text-gray-200">Welcome, {displayName || 'User'}</span>
                                    <button onClick={logout} disabled={isLoading} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-red-300 cursor-pointer">
                                        {isLoading ? 'Logging out...' : 'Logout'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6" onClick={isSidebarOpen ? closeSidebar : undefined}>
                    {children}
                </main>

                {showBackToTop && (
                    <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-opacity duration-300" aria-label="Go to top">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}