import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to the Django backend's Google login URL
        window.location.href = import.meta.env.VITE_DJANGO_GOOGLE_LOGIN_REDIRECT_URL;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Sign In</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="text-sm font-bold text-gray-600 block">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1 text-black" required disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded mt-1 text-black" required disabled={isLoading} />
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" disabled={isLoading}>
                            {isLoading ? <LoadingSpinner /> : 'Login'}
                        </button>
                    </div>
                </form>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400">Or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div>
                     <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><title>Google Logo</title><path fill="#4285F4" d="M43.611 20.083H24v8.835h11.002c-1.288 5.717-6.042 9.82-11.002 9.82-6.617 0-11.996-5.379-11.996-12s5.379-12 11.996-12c3.545 0 6.422 1.488 8.384 3.262l6.866-6.866C39.112 5.09 32.11 2 24 2 11.832 2 2 11.832 2 24s9.832 22 22 22c11.193 0 20.24-8.522 21.611-19.083v-4.834z"></path></svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

