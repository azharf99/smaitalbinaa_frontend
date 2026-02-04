import React from 'react';
import { get } from 'lodash';

const Table = ({ columns, data, onEdit, onDelete }) => {
    const renderCell = (item, column) => {
        if (column.render) {
            return column.render(get(item, column.accessor));
        }
        return get(item, column.accessor, '-');
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.length > 0 ? data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                {columns.map((col) => (
                                    <td key={col.header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {renderCell(item, col)}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {onEdit && <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:bg-gray-200 dark:p-1 dark:rounded-sm">Edit</button>}
                                        {onDelete && <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900 dark:bg-gray-200 dark:p-1 dark:rounded-sm">Delete</button>}
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;