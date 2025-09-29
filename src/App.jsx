import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ApiServiceProvider } from './context/ApiServiceContext.jsx';
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
import TahfidzPage from './pages/TahfidzPage.jsx';
import TilawahPage from './pages/TilawahPage.jsx';
import TargetTilawahPage from './pages/TargetTilawahPage.jsx';
import TilawahQuickCreatePage from './pages/TilawahQuickCreatePage.jsx';
import SubjectsPage from './pages/SubjectsPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import ExtracurricularsPage from './pages/ExtracurricularsPage.jsx';
import PrivateLessonPage from './pages/PrivateLessonPage.jsx';
import PrivateSubjectPage from './pages/PrivateSubjectPage.jsx';
import PrivateGroupPage from './pages/PrivateGroupPage.jsx';
import ExtracurricularScoresPage from './pages/ExtracurricularScoresPage.jsx';
import ExtracurricularScoresQuickCreatePage from './pages/ExtracurricularScoresQuickCreatePage.jsx';
import ExtracurricularReportsPage from './pages/ExtracurricularReportsPage.jsx';
import OlympiadFieldsPage from './pages/OlympiadFieldsPage.jsx';
import OlympiadReportsPage from './pages/OlympiadReportsPage.jsx';

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
                    <ApiServiceProvider>
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
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

                        <Route path="/tahfidz" element={
                            <PrivateRoute>
                                <Layout>
                                    <TahfidzPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/tilawah" element={
                            <PrivateRoute>
                                <Layout>
                                    <TilawahPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/targets" element={
                            <PrivateRoute>
                                <Layout>
                                    <TargetTilawahPage />
                                </Layout>
                            </PrivateRoute>
                        } />

                        <Route path="/tilawah-quick-create" element={
                            <PrivateRoute>
                                <Layout>
                                    <TilawahQuickCreatePage />
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
                        <Route path="/subjects" element={
                            <PrivateRoute>
                                <Layout>
                                    <SubjectsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/courses" element={
                            <PrivateRoute>
                                <Layout>
                                    <CoursesPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/extracurriculars" element={
                            <PrivateRoute>
                                <Layout>
                                    <ExtracurricularsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/private-lessons" element={
                            <PrivateRoute>
                                <Layout>
                                    <PrivateLessonPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/private-subjects" element={
                            <PrivateRoute>
                                <Layout>
                                    <PrivateSubjectPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/private-groups" element={
                            <PrivateRoute>
                                <Layout>
                                    <PrivateGroupPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/extracurricular-scores" element={
                            <PrivateRoute>
                                <Layout>
                                    <ExtracurricularScoresPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/extracurricular-scores-quick-create" element={
                            <PrivateRoute>
                                <Layout>
                                    <ExtracurricularScoresQuickCreatePage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/extracurricular-reports" element={
                            <PrivateRoute>
                                <Layout>
                                    <ExtracurricularReportsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/olympiad-fields" element={
                            <PrivateRoute>
                                <Layout>
                                    <OlympiadFieldsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/olympiad-reports" element={
                            <PrivateRoute>
                                <Layout>
                                    <OlympiadReportsPage />
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
                    </ApiServiceProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
};

export default App;
