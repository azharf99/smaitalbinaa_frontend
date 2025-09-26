import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AcademicCalendarPage from './pages/AcademicCalendarPage.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ClassesPage from './pages/ClassesPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import AchievementsPage from './pages/AchievementsPage.jsx';
import Layout from './components/Layout.jsx';
import UsersPage from './pages/UsersPage.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PublicLayout from './components/PublicLayout.jsx';
import Login from './components/Login.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import SocialAuthCallback from './components/SocialAuthCallback.jsx';
import './App.css'
import AlumniPage from './pages/AlumniPage.jsx'; 
import NewsPage from './pages/NewsPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';

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
                        <Route path="/alumni" element={
                            <PrivateRoute>
                                <Layout>
                                    <AlumniPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/news" element={
                            <PrivateRoute>
                                <Layout>
                                    <NewsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/news/:slug" element={
                            <PublicLayout>
                                <PostDetailPage />
                            </PublicLayout>
                        } />
                        <Route path="/blog-categories" element={
                            <PrivateRoute>
                                <Layout>
                                    <CategoriesPage />
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
