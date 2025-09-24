import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicLayout({ children }) {
    const { user, logout, isLoading } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold text-gray-800">
                        School Management System
                    </Link>
                    <div>
                        {user ? (
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
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </nav>
            </header>
            <main>{children}</main>
        </div>
    );
}