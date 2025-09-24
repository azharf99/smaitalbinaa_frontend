import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UserGroupIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';

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

export default function LandingPage() {
    return (
        <div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Quick Access</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Navigate to a section
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                        {features.map((feature) => (
                            <Link to={feature.href} key={feature.name} className="flex flex-col p-6 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                    {feature.name}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
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
        </div>
    );
}