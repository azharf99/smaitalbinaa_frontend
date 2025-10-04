import React from 'react';
import Modal from './Modal';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, itemName, isDeleting }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
            <div className="p-4">
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold">{itemName}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer text-sm bg-gray-200 p-2 rounded-md shadow-md hover:bg-blue-300 text-indigo-600 hover:text-indigo-900 font-medium"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="cursor-pointer text-sm bg-red-600 p-2 rounded-md shadow-md hover:bg-red-700 text-white font-medium"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete!'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmation;