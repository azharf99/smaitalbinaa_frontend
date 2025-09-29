import React from 'react';

const SkeletonRow = ({ columns }) => (
    <tr className="animate-pulse">
        {[...Array(columns)].map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
        ))}
    </tr>
);

const TableSkeleton = ({ columns, rows = 5 }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {[...Array(rows)].map((_, i) => (
                        <SkeletonRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;