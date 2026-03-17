import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiTrash2, FiPlus } from 'react-icons/fi';

const CategoryTypes = () => {
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategoryType, setEditingCategoryType] = useState(null);
    const [deletingCategoryType, setDeletingCategoryType] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    // Fetch Category Types on component mount
    const fetchCategoryTypes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/category-type');
            if (res.data.success) {
                setCategoryTypes(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load category types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoryTypes();
    }, []);

    const openModal = (categoryType = null) => {
        if (categoryType) {
            setEditingCategoryType(categoryType);
            setFormData({ name: categoryType.name });
        } else {
            setEditingCategoryType(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '' });
        setEditingCategoryType(null);
    };

    const openDeleteModal = (categoryType) => {
        setDeletingCategoryType(categoryType);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingCategoryType(null);
        setIsDeleteModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.warning('Category Type name is required');

        try {
            setIsSubmitting(true);
            if (editingCategoryType) {
                // Update
                await api.put(`/category-type/${editingCategoryType._id}`, { name: formData.name });
                toast.success('Category Type updated safely!');
            } else {
                // Create
                await api.post('/category-type', { name: formData.name });
                toast.success('Category Type created beautifully!');
            }
            fetchCategoryTypes();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCategoryType) return;
        try {
            setIsSubmitting(true);
            await api.delete(`/category-type/${deletingCategoryType._id}`);
            toast.success('Category Type deleted successfully!');
            fetchCategoryTypes();
            closeDeleteModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete Category Type');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b border-gray-100 bg-white/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Category Types</h2>
                    <p className="text-gray-500 text-sm mt-1">Define distinct classifications to group your inventory.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Type
                </button>
            </div>

            {/* Main Interactive Grid Content */}
            <div className="flex-1 p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                ) : categoryTypes.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-gray-500 text-lg font-medium">No Category Types Found. Create your first classification!</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {categoryTypes.map((type) => (
                            <div
                                key={type._id}
                                className="group relative flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:bg-green-50 hover:border-green-200 hover:shadow-md transition-all duration-300 min-w-[200px]"
                            >
                                <span className="font-semibold text-gray-700 group-hover:text-green-800 transition-colors pr-10">
                                    {type.name}
                                </span>

                                <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openModal(type); }}
                                        className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openDeleteModal(type); }}
                                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingCategoryType ? 'Edit Category Type' : 'New Category Type'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Type Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400"
                                    placeholder="e.g. Vegetarian"
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm shadow-green-600/20 disabled:opacity-70 flex items-center gap-2 transition-all"
                                >
                                    {isSubmitting && <div className="w-4 h-4 border-2 border-green-200 border-t-white rounded-full animate-spin"></div>}
                                    {editingCategoryType ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteModal} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Category Type?</h3>
                        <p className="text-gray-500 mb-6 font-medium">
                            Are you sure you want to delete "<span className="text-gray-800 font-bold">{deletingCategoryType?.name}</span>"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-600/20 transition-colors flex-1 flex justify-center items-center"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-red-200 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryTypes;
