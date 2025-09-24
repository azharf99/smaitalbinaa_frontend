import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AcademicCalendarPage from './components/AcademicCalendar.jsx';
import Login from './components/Login.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import SocialAuthCallback from './components/SocialAuthCallback.jsx';
import './App.css'

const AppContent = ({ isLogin = false }) => {
    const { user, logout, isLoading } = useAuth();
    if (isLogin) {
        return <Login />;
    }
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <nav className="container mx-auto px-6 py-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-800">School Management System</h1>
                        {user && (
                            <button
                                onClick={logout}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-red-300"
                            >
                                {isLoading ? 'Logging out...' : 'Logout'}
                            </button>
                        )}
                    </div>
                </nav>
            </header>
            <main>
                <AcademicCalendarPage />
            </main>
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
                    <Route path="/login" element={<AppContent isLogin={true} />} />
                    <Route path="/calendar" element={
                        <PrivateRoute>
                            <AppContent />
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/calendar" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
