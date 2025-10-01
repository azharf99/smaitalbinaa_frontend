import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UserGroupIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';
import RecentPosts from './RecentPosts.jsx';
import { useAchievements } from '../hooks/useAchievements.js';
import { SkeletonCard } from '../common/Skeleton.jsx';

const features = [
    {
        name: 'Academic Calendar',
        description: 'View and manage school events, holidays, and important dates.',
        href: '/calendar',
        icon: CalendarIcon,
    },
    {
        name: 'Student Management',
        description: 'Access and manage student profiles, classes, and information.',
        href: '/students',
        icon: UserGroupIcon,
    },
    {
        name: 'Class Management',
        description: 'Organize and administrate all student classes and categories.',
        href: '/classes',
        icon: AcademicCapIcon,
    },
    {
        name: 'Achievements',
        description: 'Showcase and celebrate the outstanding achievements of our students.',
        href: '/achievements',
        icon: SparklesIcon,
    },
];

// Achievement Card Component for Landing Page
const AchievementCard = ({ item }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img 
                className="w-full h-48 object-cover object-center" 
                src={item.photo || 'https://via.placeholder.com/400x300?text=No+Image'} 
                alt={item.name} 
            />
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.name}</h3>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{item.awardee}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.predicate} - {item.level} ({item.year})</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Organized by: {item.organizer}</p>
            </div>
        </div>
    );
};

export default function LandingPage() {
    const { items: achievements, isInitialLoading: achievementsLoading } = useAchievements();
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                    alt="Graduation"
                    className="absolute inset-0 -z-10 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24 relative z-10">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                            School Management System
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-300">
                            Welcome! Manage all aspects of your school from one central dashboard.
                        </p>
                    </div>
                </div>
            </div>
            

            {/* Features Section */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Quick Access</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Navigate to a section
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                        {features.map((feature) => (
                            <Link to={feature.href} key={feature.name} className="flex flex-col p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                    {feature.name}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">{feature.description}</p>
                                    <p className="mt-6">
                                        <span className="text-sm font-semibold leading-6 text-indigo-600">
                                            Go to {feature.name} <span aria-hidden="true">→</span>
                                        </span>
                                    </p>
                                </dd>
                            </Link>
                        ))}
                    </dl>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Recent Achievements</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Celebrating Student Success
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Discover the outstanding achievements of our students across various competitions and activities.
                    </p>
                </div>
                
                <div className="mt-16">
                    {achievementsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {achievements.slice(0, 6).map(achievement => (
                                <AchievementCard key={achievement.id} item={achievement} />
                            ))}
                        </div>
                    )}
                    
                    {!achievementsLoading && achievements.length > 0 && (
                        <div className="mt-8 text-center">
                            <Link 
                                to="/achievements" 
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                            >
                                View All Achievements
                                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <RecentPosts />
            </div>
        </div>
    );
}