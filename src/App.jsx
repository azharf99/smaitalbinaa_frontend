import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AcademicCalendarPage from './components/AcademicCalendar.jsx';
import ClassesPage from './components/ClassesPage.jsx';
import StudentsPage from './components/StudentsPage.jsx';
import AchievementsPage from './components/AchievementsPage.jsx';
import UsersPage from './components/UsersPage.jsx';
import TeachersPage from './components/TeachersPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import PublicLayout from './components/PublicLayout.jsx';
import Login from './components/Login.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import SocialAuthCallback from './components/SocialAuthCallback.jsx';
import './App.css'

const navLinkClasses = "flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200";
const activeNavLinkClasses = "bg-gray-300 font-bold";

const Layout = ({ children }) => {
    const { user, logout, isLoading } = useAuth();
    console.log(user)
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0">
                <div className="p-4">
                    <h1 className="text-xl font-bold text-gray-800">School System</h1>
                </div>
                <nav className="mt-4 px-2">
                    <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end>
                        Dashboard
                    </NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        Academic Calendar
                    </NavLink>
                    <NavLink to="/achievements" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        Achievements
                    </NavLink>
                    <NavLink to="/students" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        Students
                    </NavLink>
                    <NavLink to="/classes" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        Classes
                    </NavLink>
                    <NavLink to="/teachers" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        Teachers
                    </NavLink>
                    {user?.is_superuser && (
                        <NavLink to="/users" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                            Users
                        </NavLink>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-6 py-3">
                        <div className="flex justify-end items-center">
                            {user && (
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-800">Welcome, {user.username || 'User'}</span>
                                    <button
                                        onClick={logout}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-red-300 cursor-pointer"
                                    >
                                        {isLoading ? 'Logging out...' : 'Logout'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

const PrivateRoute = ({ children }) => {
    const { user, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>; // Or a full page loader
    }

    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};


const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/social-auth-callback" element={<SocialAuthCallback />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/welcome" element={
                        <PublicLayout>
                            <LandingPage />
                        </PublicLayout>
                    } />
                    <Route path="/calendar" element={
                        <PrivateRoute>
                            <Layout>
                                <AcademicCalendarPage />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/achievements" element={
                        <PrivateRoute>
                            <Layout>
                                <AchievementsPage />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/students" element={
                        <PrivateRoute>
                            <Layout>
                                <StudentsPage />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/classes" element={
                        <PrivateRoute>
                            <Layout>
                                <ClassesPage />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/teachers" element={
                        <PrivateRoute>
                            <Layout>
                                <TeachersPage />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="/users" element={
                        <PrivateRoute>
                            <Layout>
                                <UsersPage />
                            </Layout>
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
