import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiImage, FiSearch, FiLayers } from 'react-icons/fi';

const SubCategories = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeSearch, setTypeSearch] = useState('');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [formData, setFormData] = useState({
        subCategoryName: '',
        subCategoryImage: null,
        mainCategory: { name: '', mainCategoryId: '' },
        categoryType: [],
        active: true
    });
    const [imagePreview, setImagePreview] = useState(null);

    // Fetch All Data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [subRes, catRes, typeRes] = await Promise.all([
                api.get('/sub-category'),
                api.get('/category'),
                api.get('/category-type')
            ]);

            if (subRes.data.success) setSubCategories(subRes.data.data);
            if (catRes.data.success) setCategories(catRes.data.data);
            if (typeRes.data.success) setCategoryTypes(typeRes.data.data);
        } catch (error) {
            toast.error('Failed to load data components');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (sub = null) => {
        if (sub) {
            setEditingSub(sub);
            setFormData({
                subCategoryName: sub.subCategoryName || '',
                subCategoryImage: null,
                mainCategory: {
                    name: sub.mainCategory?.name || '',
                    mainCategoryId: sub.mainCategory?.mainCategoryId?._id || sub.mainCategory?.mainCategoryId || ''
                },
                categoryType: sub.categoryType?.map(t => ({
                    name: t.name,
                    categoryId: t.categoryId?._id || t.categoryId
                })) || [],
                active: sub.active !== undefined ? sub.active : true
            });
            setImagePreview(sub.subCategoryImage?.path?.medium ? `${import.meta.env.VITE_SERVER_URL}${sub.subCategoryImage.path.medium}` : null);
        } else {
            setEditingSub(null);
            setFormData({
                subCategoryName: '',
                subCategoryImage: null,
                mainCategory: { name: '', mainCategoryId: '' },
                categoryType: [],
                active: true
            });
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSub(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, subCategoryImage: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleMainCategoryChange = (e) => {
        const selectedId = e.target.value;
        const selectedCat = categories.find(c => c._id === selectedId);
        setFormData({
            ...formData,
            mainCategory: {
                name: selectedCat ? selectedCat.name : '',
                mainCategoryId: selectedId
            }
        });
    };

    const toggleCategoryType = (type) => {
        const isSelected = formData.categoryType.some(t => t.categoryId === type._id);
        if (isSelected) {
            setFormData({
                ...formData,
                categoryType: formData.categoryType.filter(t => t.categoryId !== type._id)
            });
        } else {
            setFormData({
                ...formData,
                categoryType: [...formData.categoryType, { name: type.name, categoryId: type._id }]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subCategoryName.trim()) return toast.warning('Sub-Category name is required');
        if (!formData.mainCategory.mainCategoryId) return toast.warning('Please select a main category');
        if (formData.categoryType.length === 0) return toast.warning('Please select at least one category type');

        try {
            setIsSubmitting(true);
            const payload = new FormData();
            payload.append('subCategoryName', formData.subCategoryName);
            if (formData.subCategoryImage) payload.append('files', formData.subCategoryImage);
            payload.append('mainCategory', JSON.stringify(formData.mainCategory));
            payload.append('categoryType', JSON.stringify(formData.categoryType));
            payload.append('active', formData.active);

            if (editingSub) {
                await api.put(`/sub-category/${editingSub._id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Sub-Category updated successfully!');
            } else {
                await api.post('/sub-category', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Sub-Category created beautifully!');
            }
            fetchData();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this sub-category?')) return;
        try {
            await api.delete(`/sub-category/${id}`);
            toast.success('Deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    const filteredSubs = subCategories.filter(s =>
        s.subCategoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.mainCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 min-h-[700px] flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Section */}
            <div className="p-8 lg:p-10 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-600/20">
                                <FiLayers />
                            </div>
                            Sub-Categories
                        </h2>
                        <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
                            Manage the hierarchy of your product catalog.
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-2xl font-bold shadow-xl shadow-green-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 group"
                    >
                        <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Add Sub-Category
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mt-8 relative max-w-md">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search sub-categories or main categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-gray-100 border-none rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none font-medium text-gray-700"
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 p-8">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-bold animate-pulse">Syncing catalog...</p>
                    </div>
                ) : filteredSubs.length === 0 ? (
                    <div className="text-center py-24 border-3 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <FiLayers className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-xl font-bold">No Sub-Categories Found</p>
                        <p className="text-gray-400 mt-2">Try adjusting your search or add a new one.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="px-8 py-5">Sub-Category Info</th>
                                    <th className="px-8 py-5">Main Category</th>
                                    <th className="px-8 py-5">Included Types</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSubs.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-green-50/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                {sub.subCategoryImage?.path?.thumbnail ? (
                                                    <img src={`${import.meta.env.VITE_SERVER_URL}${sub.subCategoryImage.path.thumbnail}`} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" alt={sub.subCategoryName} />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 shrink-0 border border-gray-100">
                                                        <FiImage className="w-5 h-5 opacity-40" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 text-base">{sub.subCategoryName}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sub-Category ID: {sub._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span className="text-sm font-semibold text-gray-600">{sub.mainCategory?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-700">{sub.categoryType?.length || 0}</span>
                                                    <span className="text-xs font-medium text-gray-400">Items mapped</span>
                                                </div>
                                                <div className="flex gap-1.5 items-center">
                                                    <div className="flex -space-x-1">
                                                        {sub.categoryType?.slice(0, 3).map((_, i) => (
                                                            <div key={i} className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-400">
                                                                {i + 1}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                                        {sub.categoryType?.slice(0, 2).map(t => t.name).join(', ')}
                                                        {sub.categoryType?.length > 2 ? '...' : ''}
                                                    </p>
                                                    {sub.categoryType?.length > 2 && (
                                                        <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md text-[9px] font-bold">
                                                            +{sub.categoryType.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-1.5 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <button
                                                    onClick={() => openModal(sub)}
                                                    className="w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sub._id)}
                                                    className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Implementation */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 lg:p-10 overflow-y-auto">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={closeModal} />

                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 animate-in zoom-in-95 fill-mode-both duration-300 overflow-hidden">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 lg:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {editingSub ? 'Edit Sub-Category' : 'New Sub-Category'}
                                    </h3>
                                    <p className="text-gray-400 font-medium text-[10px] mt-0.5 uppercase tracking-wider">Configure Catalog Hierarchy</p>
                                </div>
                                <button type="button" onClick={closeModal} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all shadow-sm">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 lg:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {/* Name and Main Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sub-Category Name</label>
                                        <input
                                            type="text" required value={formData.subCategoryName}
                                            onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700 text-sm"
                                            placeholder="e.g. Personal Care"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Main Category</label>
                                        <select
                                            required value={formData.mainCategory.mainCategoryId}
                                            onChange={handleMainCategoryChange}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700 text-sm appearance-none"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Image Section */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sub-Category Image</label>
                                    <div className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        {imagePreview ? (
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md ring-2 ring-white shrink-0">
                                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                <button
                                                    type="button" onClick={() => { setImagePreview(null); setFormData({ ...formData, subCategoryImage: null }); }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded shadow-sm hover:bg-red-600 transition-colors"
                                                >
                                                    <FiX className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 shrink-0 shadow-sm">
                                                <FiImage className="w-8 h-8 opacity-30" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600 font-semibold">Upload cover image</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Recommended: PNG or JPG. Max 2MB.</p>
                                            <input
                                                type="file" accept="image/*" onChange={handleImageChange}
                                                className="mt-3 w-full text-[10px] text-green-600 font-bold file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-green-50 file:text-green-600 hover:file:bg-green-100 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Category Types Searchable Multi-Select */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                                        Included Types
                                        <span className="text-[10px] text-green-600 font-semibold">{formData.categoryType.length} Selected</span>
                                    </label>

                                    <div className="relative">
                                        {/* Dropdown Trigger & Search */}
                                        <div
                                            className="min-h-[50px] p-1.5 bg-gray-50 border border-gray-100 focus-within:border-green-500 focus-within:bg-white rounded-xl transition-all flex flex-wrap gap-1.5 cursor-text"
                                            onClick={() => setIsTypeDropdownOpen(true)}
                                        >
                                            {formData.categoryType.map(t => (
                                                <span key={t.categoryId} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-[11px] font-semibold animate-in zoom-in-95 duration-200">
                                                    {t.name}
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleCategoryType({ _id: t.categoryId, name: t.name }); }} className="bg-green-600/50 hover:bg-red-500 rounded p-0.5 transition-colors">
                                                        <FiX className="w-2.5 h-2.5" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder={formData.categoryType.length === 0 ? "Search and add types..." : ""}
                                                value={typeSearch}
                                                onChange={(e) => { setTypeSearch(e.target.value); setIsTypeDropdownOpen(true); }}
                                                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm font-medium text-gray-700 px-2 h-8"
                                            />
                                        </div>

                                        {/* Dropdown Menu (Opens Upwards to avoid clipping) */}
                                        {isTypeDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsTypeDropdownOpen(false)} />
                                                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-2 duration-200">
                                                    {categoryTypes
                                                        .filter(t => t.name.toLowerCase().includes(typeSearch.toLowerCase()))
                                                        .map(type => {
                                                            const isSelected = formData.categoryType.some(st => st.categoryId === type._id);
                                                            return (
                                                                <button
                                                                    key={type._id} type="button"
                                                                    onClick={() => { toggleCategoryType(type); setTypeSearch(''); }}
                                                                    className={`w-full p-2.5 mb-0.5 rounded-lg flex items-center justify-between transition-all group ${isSelected ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                                                >
                                                                    <span className="text-xs font-semibold">{type.name}</span>
                                                                    {isSelected && <FiCheck className="w-3.5 h-3.5 text-green-500" />}
                                                                </button>
                                                            );
                                                        })
                                                    }
                                                    {categoryTypes.filter(t => t.name.toLowerCase().includes(typeSearch.toLowerCase())).length === 0 && (
                                                        <div className="p-6 text-center text-gray-400 font-medium text-xs italic">
                                                            No types found
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 lg:p-8 bg-gray-50/30 flex gap-3 justify-end border-t border-gray-100">
                                <button
                                    type="button" onClick={closeModal}
                                    className="px-5 py-2 text-gray-500 font-semibold text-xs hover:bg-white rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={isSubmitting}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-lg shadow-md shadow-green-600/10 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95"
                                >
                                    {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck className="w-3.5 h-3.5" />}
                                    {editingSub ? 'Save Changes' : 'Create Sub-Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategories;
