import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { SkeletonRow } from '../common/Skeleton.jsx';
import { useLaporanPertanggungJawaban } from '../hooks/useLaporanPertanggungJawaban.js';

const initialState = {
    program: '',
    tujuan: '',
    indikator: '',
    waktu_pelaksanaan: '',
    status: 'Draft', // Assuming this is a frontend-only or default status
    capaian: '',
    keterangan: '',
    pengeluaran: '',
};

// --- UI Components ---

const LaporanPertanggungJawabanForm = ({ currentItem, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(initialState);    

    useEffect(() => {
        if (currentItem) {
            setFormData({ ...initialState, ...currentItem });
        } else {
            setFormData(initialState);
        }
    }, [currentItem]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));            
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const isEditing = !!(currentItem && currentItem.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Program</label>
                    <input type="text" id="program" name="program" placeholder="Nama Program" value={formData.program || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSubmitting}>
                        <option value="Draft">Draft</option>
                        <option value="On Going">On Going</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="waktu_pelaksanaan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu Pelaksanaan</label>
                    <input type="text" id="waktu_pelaksanaan" name="waktu_pelaksanaan" placeholder="e.g., Januari 2024" value={formData.waktu_pelaksanaan || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor="pengeluaran" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pengeluaran</label>
                    <input type="text" id="pengeluaran" name="pengeluaran" placeholder="Pengeluaran" value={formData.pengeluaran || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
                </div>
            </div>
            <div>
                <label htmlFor="tujuan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tujuan</label>
                <textarea id="tujuan" name="tujuan" placeholder="Tujuan Program" value={formData.tujuan || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
            </div>
            <div>
                <label htmlFor="indikator" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Indikator Keberhasilan</label>
                <textarea id="indikator" name="indikator" placeholder="Indikator Keberhasilan" value={formData.indikator || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
            </div>
            <div>
                <label htmlFor="capaian" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capaian Program</label>
                <textarea id="capaian" name="capaian" placeholder="Capaian Program" value={formData.capaian || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
            </div>
            <div>
                <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan</label>
                <textarea id="keterangan" name="keterangan" placeholder="Keterangan tambahan" value={formData.keterangan || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" disabled={isSubmitting} />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner /> : (isEditing ? 'Update' : 'Save')}
                </button>
            </div>
        </form>
    );
};

const LaporanPertanggungJawabanTable = ({ items, onEdit, onDelete, error, hasSearchQuery }) => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Laporan Pertanggung Jawaban List</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pelaksanaan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengeluaran</th>
                        {isAuthenticated && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.program || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {item.status || 'N/A'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.waktu_pelaksanaan ? new Date(item.waktu_pelaksanaan).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.pengeluaran || 'N/A'}</td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer">Edit</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                                </td>
                            )}
                        </tr>
                    )) : !error && (
                       <tr><td colSpan={isAuthenticated ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                           {hasSearchQuery ? 'No laporan pertanggung jawaban match your search.' : 'No laporan pertanggung jawaban found.'}
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const LoadingLaporanPertanggungJawabanTable = () => {
    const { isAuthenticated } = useAuth();
    const columns = isAuthenticated ? 6 : 5;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-300 dark:text-gray-600 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{Array.from({ length: columns }).map((_, i) => <th key={i} scope="col" className="px-6 py-3"></th>)}</tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody></table>
        </div>
    );
};

// --- Main Page Component ---

export default function LaporanPertanggungJawabanPage() {
    const {
        items,
        count,
        nextPage,
        previousPage,
        isDataLoading,
        isSubmitting,
        error,
        searchQuery,
        setSearchQuery,
        saveLaporanPertanggungJawaban,
        deleteLaporanPertanggungJawaban,
        handlePageChange
    } = useLaporanPertanggungJawaban();

    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { isAuthenticated } = useAuth();

    const handleSave = async (formData) => {
        try {
            await saveLaporanPertanggungJawaban(formData, currentItem);
            closeModal();
        } catch (err) {
            console.error("Failed to save laporan pertanggung jawaban:", err);
            alert(`Failed to save laporan pertanggung jawaban. Error: ${err.message}`);
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this laporan pertanggung jawaban?')) {
            await deleteLaporanPertanggungJawaban(id);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <>
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight dark:text-white">Laporan Pertanggung Jawaban Management</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-white">Manage laporan pertanggung jawaban information.</p>
                </div>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                        Add New Laporan
                    </button>
                )}
            </header>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by program or status..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <main>
                {isDataLoading ? (
                    <LoadingLaporanPertanggungJawabanTable />
                ) : (
                    <>
                        <LaporanPertanggungJawabanTable
                            items={items}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            error={error}
                            hasSearchQuery={!!searchQuery}
                        />
                        {count > 0 && (
                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    Total <span className="font-medium">{count}</span> results
                                </span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handlePageChange(previousPage)} disabled={!previousPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                                    <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem && currentItem.id ? 'Edit Laporan Pertanggung Jawaban' : 'Add New Laporan Pertanggung Jawaban'}>
                <LaporanPertanggungJawabanForm 
                    currentItem={currentItem}
                    onSave={handleSave}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
}
