import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
            <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;