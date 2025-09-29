import React from 'react';

const Card = ({ item, onEdit, onDelete, title, imageUrl, children }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {imageUrl && (
                <img src={imageUrl} alt={title || 'Card image'} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
                {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-2">{title}</h3>}
                <div className="text-sm">
                    {children}
                </div>
                {(onEdit || onDelete) && (
                    <div className="mt-4 flex justify-end space-x-2">
                        {onEdit && <button onClick={() => onEdit(item)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>}
                        {onDelete && <button onClick={() => onDelete(item)} className="text-sm text-red-600 hover:text-red-900 font-medium">Delete</button>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;