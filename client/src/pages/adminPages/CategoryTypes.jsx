import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiTrash2, FiPlus, FiImage, FiUploadCloud, FiMove } from 'react-icons/fi';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ type, openModal, setDeletingCategoryType, setIsDeleteModalOpen }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: type._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center gap-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl cursor-default hover:bg-green-50 hover:border-green-200 hover:shadow-md transition-all duration-300 min-w-[280px] ${isDragging ? 'shadow-xl ring-2 ring-green-500/20' : ''}`}
        >
            <div className="absolute -top-2 -left-2 bg-white border border-gray-200 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-sm z-10 group-hover:border-green-500 group-hover:text-green-600 transition-colors">
                {type.order}
            </div>

            {/* Image Preview in List */}
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                {type.imageId?.path?.thumbnail ? (
                    <img
                        src={`${import.meta.env.VITE_SERVER_URL}${type.imageId.path.thumbnail}`}
                        alt={type.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FiImage className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 pr-20">
                <h4 className="font-bold text-gray-700 group-hover:text-green-800 transition-colors truncate">
                    {type.name}
                </h4>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">System Type</p>
            </div>

            <div className="absolute right-3 flex items-center gap-1">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={() => openModal(type)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                        title="Edit Record"
                    >
                        <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setDeletingCategoryType(type); setIsDeleteModalOpen(true); }}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                        title="Delete Permanently"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="p-2 text-gray-400 hover:text-green-600 cursor-grab active:cursor-grabbing transition-colors"
                    title="Drag to Reorder"
                >
                    <FiMove className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

const CategoryTypes = () => {
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategoryType, setEditingCategoryType] = useState(null);
    const [deletingCategoryType, setDeletingCategoryType] = useState(null);

    const initialFormState = { name: '', order: 0 };
    const [formData, setFormData] = useState(initialFormState);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = categoryTypes.findIndex((item) => item._id === active.id);
            const newIndex = categoryTypes.findIndex((item) => item._id === over.id);

            const newOrder = arrayMove(categoryTypes, oldIndex, newIndex);

            // Optimistically update UI
            const updatedWithOrder = newOrder.map((item, index) => ({
                ...item,
                order: index + 1
            }));
            setCategoryTypes(updatedWithOrder);

            try {
                // Prepare data for backend
                const orders = updatedWithOrder.map(item => ({
                    id: item._id,
                    order: item.order
                }));

                await api.put('/category-type/reorder', { orders });
                toast.success('Order synchronized successfully');
            } catch (error) {
                toast.error('Failed to save new order');
                fetchCategoryTypes(); // Rollback on error
            }
        }
    };

    const openModal = (categoryType = null) => {
        if (categoryType) {
            setEditingCategoryType(categoryType);
            setFormData({
                name: categoryType.name,
                order: categoryType.order || 0
            });
            setImagePreview(categoryType.imageId?.path?.medium ? `${import.meta.env.VITE_SERVER_URL}${categoryType.imageId.path.medium}` : null);
        } else {
            setEditingCategoryType(null);
            setFormData({
                ...initialFormState,
                order: categoryTypes.length + 1 // Default order for new item
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingCategoryType(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.warning('Category Type name is required');

        try {
            setIsSubmitting(true);
            const payloadData = new FormData();

            // Backend expects the main JSON data in a 'data' field
            payloadData.append('data', JSON.stringify({
                ...formData,
                order: Number(formData.order)
            }));

            if (imageFile) {
                payloadData.append('image', imageFile);
            }

            if (editingCategoryType) {
                // Update
                await api.put(`/category-type/${editingCategoryType._id}`, payloadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category Type updated beautifully!');
            } else {
                // Create
                await api.post('/category-type', payloadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category Type created powerfully!');
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
            setIsDeleteModalOpen(false);
            setDeletingCategoryType(null);
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
                    <p className="text-gray-500 text-sm mt-1">Define and drag to reorder distinct classifications for your inventory.</p>
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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={categoryTypes.map(item => item._id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-wrap gap-4">
                                {categoryTypes.map((type) => (
                                    <SortableItem
                                        key={type._id}
                                        type={type}
                                        openModal={openModal}
                                        setDeletingCategoryType={setDeletingCategoryType}
                                        setIsDeleteModalOpen={setIsDeleteModalOpen}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                {editingCategoryType ? <FiEdit2 className="text-blue-500" /> : <FiPlus className="text-green-500" />}
                                {editingCategoryType ? 'Refine Category Type' : 'Establish New Category Type'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full p-2 hover:bg-gray-100">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                            {/* Image Upload Area */}
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Cover Representation</label>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 group-hover:border-green-300 transition-colors">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiImage className="w-10 h-10 text-gray-300" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-2 font-medium">Auto-optimized for rapid delivery. Supports WebP/JPG/PNG.</p>
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                                            <FiUploadCloud /> {imagePreview ? 'Replace Image' : 'Select Image'}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Internal Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400 font-semibold"
                                        placeholder="e.g. Refreshments"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Sort</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all text-center font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end items-center">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-70 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {isSubmitting && <div className="w-5 h-5 border-2 border-green-200 border-t-white rounded-full animate-spin"></div>}
                                    {editingCategoryType ? 'Update Global Record' : 'Publish Setup'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiTrash2 className="w-10 h-10 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Purge Record?</h3>
                        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                            Deleting "<span className="text-gray-900 font-bold">{deletingCategoryType?.name}</span>" is irreversible and may affect associated items.
                        </p>
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl flex-1 transition-colors"
                            >
                                Reconsider
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 flex-1 transition-all"
                            >
                                {isSubmitting ? '...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryTypes;
