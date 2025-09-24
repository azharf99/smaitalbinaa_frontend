import React from 'react';

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-200/80 dark:via-gray-700/80 to-transparent"></div>
);

export const SkeletonCard = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative w-full h-56 bg-gray-300 dark:bg-gray-700 overflow-hidden">
                <Shimmer />
            </div>
            <div className="p-6">
                <div className="relative h-6 w-3/4 mb-4 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden"><Shimmer /></div>
                <div className="relative h-4 w-1/2 mb-2 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden"><Shimmer /></div>
                <div className="relative h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden"><Shimmer /></div>
            </div>
        </div>
    );
};

export const SkeletonRow = ({ columns = 5 }) => {
    return (
        <tr>
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-5 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
                        <Shimmer />
                    </div>
                </td>
            ))}
        </tr>
    );
};