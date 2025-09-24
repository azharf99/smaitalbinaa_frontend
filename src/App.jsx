import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AcademicCalendarPage from './components/AcademicCalendar.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ClassesPage from './components/ClassesPage.jsx';
import StudentsPage from './components/StudentsPage.jsx';
import AchievementsPage from './components/AchievementsPage.jsx';
import Layout from './components/Layout.jsx';
import UsersPage from './components/UsersPage.jsx';
import TeachersPage from './components/TeachersPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import PublicLayout from './components/PublicLayout.jsx';
import Login from './components/Login.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import SocialAuthCallback from './components/SocialAuthCallback.jsx';
import './App.css'

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
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/social-auth-callback" element={<SocialAuthCallback />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/welcome" element={
                            <PublicLayout>
                                <LandingPage />
                            </PublicLayout>
                        } />
                        <Route path="/" element={
                            <PrivateRoute>
                                <Layout>
                                    <div className="text-gray-900 dark:text-white">
                                        <LandingPage />
                                    </div>
                                </Layout>
                            </PrivateRoute>
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
            </ThemeProvider>
        </Router>
    );
};

export default App;
