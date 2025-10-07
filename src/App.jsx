import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ApiServiceProvider } from './context/ApiServiceContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
const AcademicCalendarPage = React.lazy(() => import('./pages/AcademicCalendarPage.jsx'));
const ClassesPage = React.lazy(() => import('./pages/ClassesPage.jsx'));
const StudentsPage = React.lazy(() => import('./pages/StudentsPage.jsx'));
const AchievementsPage = React.lazy(() => import('./pages/AchievementsPage.jsx'));
const Layout = React.lazy(() => import('./components/Layout.jsx'));
const UsersPage = React.lazy(() => import('./pages/UsersPage.jsx'));
const TeachersPage = React.lazy(() => import('./pages/TeachersPage.jsx'));
const LandingPage = React.lazy(() => import('./pages/LandingPage.jsx'));
const PublicLayout = React.lazy(() => import('./components/PublicLayout.jsx'));
const Login = React.lazy(() => import('./components/Login.jsx'));
const LoadingSpinner = React.lazy(() => import('./common/LoadingSpinner.jsx'));
const SocialAuthCallback = React.lazy(() => import('./components/SocialAuthCallback.jsx'));
import './App.css'
const AlumniPage = React.lazy(() => import('./pages/AlumniPage.jsx')); 
const NewsPage = React.lazy(() => import('./pages/NewsPage.jsx'));
const PostDetailPage = React.lazy(() => import('./pages/PostDetailPage.jsx'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage.jsx'));
const TahfidzPage = React.lazy(() => import('./pages/TahfidzPage.jsx'));
const TilawahPage = React.lazy(() => import('./pages/TilawahPage.jsx'));
const TargetTilawahPage = React.lazy(() => import('./pages/TargetTilawahPage.jsx'));
const TilawahQuickCreatePage = React.lazy(() => import('./pages/TilawahQuickCreatePage.jsx'));
const SubjectsPage = React.lazy(() => import('./pages/SubjectsPage.jsx'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage.jsx'));
const ExtracurricularsPage = React.lazy(() => import('./pages/ExtracurricularsPage.jsx'));
const PrivateLessonPage = React.lazy(() => import('./pages/PrivateLessonPage.jsx'));
const PrivateSubjectPage = React.lazy(() => import('./pages/PrivateSubjectPage.jsx'));
const PrivateGroupPage = React.lazy(() => import('./pages/PrivateGroupPage.jsx'));
const ExtracurricularScoresPage = React.lazy(() => import('./pages/ExtracurricularScoresPage.jsx'));
const ExtracurricularScoresQuickCreatePage = React.lazy(() => import('./pages/ExtracurricularScoresQuickCreatePage.jsx'));
const ExtracurricularReportsPage = React.lazy(() => import('./pages/ExtracurricularReportsPage.jsx'));
const OlympiadFieldsPage = React.lazy(() => import('./pages/OlympiadFieldsPage.jsx'));
const OlympiadReportsPage = React.lazy(() => import('./pages/OlympiadReportsPage.jsx'));
const PeriodsPage = React.lazy(() => import('./pages/PeriodsPage.jsx'));
const SchedulesPage = React.lazy(() => import('./pages/SchedulesPage.jsx'));
const ReporterSchedulesPage = React.lazy(() => import('./pages/ReporterSchedulesPage.jsx'));
const ClassReportsPage = React.lazy(() => import('./pages/ClassReportsPage.jsx'));
const ClassReportsQuickCreatePage = React.lazy(() => import('./pages/ClassReportsQuickCreatePage.jsx'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage.jsx'));
const StudentProjectsPage = React.lazy(() => import('./pages/StudentProjectsPage.jsx'));
const StudentTeamsPage = React.lazy(() => import('./pages/StudentTeamsPage.jsx'));
const StudentDailyPlanPage = React.lazy(() => import('./pages/StudentDailyPlanPage.jsx'));
const LaporanPertanggungJawabanPage = React.lazy(() => import('./pages/LaporanPertanggungJawabanPage.jsx'));
const ProgramKerjaPage = React.lazy(() => import('./pages/ProgramKerjaPage.jsx'));

const PrivateRoute = ({ children }) => {
    const { user, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
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
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
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
                        <Route path="/periods" element={
                            <PrivateRoute>
                                <Layout>
                                    <PeriodsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/schedules" element={
                            <PrivateRoute>
                                <Layout>
                                    <SchedulesPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/reporter-schedules" element={
                            <PrivateRoute>
                                <Layout>
                                    <ReporterSchedulesPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/class-reports" element={
                            <PrivateRoute>
                                <Layout>
                                    <ClassReportsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/class-reports-quick-create" element={
                            <PrivateRoute>
                                <Layout>
                                    <ClassReportsQuickCreatePage />
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
                        <Route path="/notifications" element={
                            <PrivateRoute>
                                <Layout>
                                    <NotificationsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/student-projects" element={
                            <PrivateRoute>
                                <Layout>
                                    <StudentProjectsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/student-teams" element={
                            <PrivateRoute>
                                <Layout>
                                    <StudentTeamsPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/student-daily-plans" element={
                            <PrivateRoute>
                                <Layout>
                                    <StudentDailyPlanPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/laporan-pertanggung-jawaban" element={
                            <PrivateRoute>
                                <Layout>
                                    <LaporanPertanggungJawabanPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/program-kerja" element={
                            <PrivateRoute>
                                <Layout>
                                    <ProgramKerjaPage />
                                </Layout>
                            </PrivateRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    </Suspense>
                    </ApiServiceProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
};

export default App;
