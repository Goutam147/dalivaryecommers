import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);

    // Brand specific form structure. models is a visual string that we will split into an array
    const [formData, setFormData] = useState({ name: '', active: true, models: '' });

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const res = await api.get('/brand');
            if (res.data.success) {
                setBrands(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const openModal = (brand = null) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                active: brand.active,
                models: brand.model ? brand.model.join(', ') : ''
            });
        } else {
            setEditingBrand(null);
            setFormData({ name: '', active: true, models: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', active: true, models: '' });
        setEditingBrand(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.warning('Brand name is required');

        try {
            setIsSubmitting(true);

            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('active', formData.active);

            // Split comma separated models string into array and append each to FormData
            if (formData.models.trim()) {
                const modelsArray = formData.models.split(',').map(m => m.trim()).filter(Boolean);
                modelsArray.forEach(m => payload.append('model', m));
            }

            if (editingBrand) {
                await api.put(`/brand/${editingBrand._id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Brand updated safely!');
            } else {
                await api.post('/brand', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Brand created beautifully!');
            }

            fetchBrands();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col relative overflow-hidden">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b border-gray-100 bg-white/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Brands</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure physical brands and supported model numbers.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <FiCheck className="w-4 h-4" />
                    Add Brand
                </button>
            </div>

            {/* Main Table Content */}
            <div className="flex-1 p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-gray-500 text-lg font-medium">No Brands Found. Create your first one!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Brand Name</th>
                                    <th className="px-6 py-4">Associated Models</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {brands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-green-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {brand.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm w-1/3">
                                            <div className="flex flex-wrap gap-1">
                                                {brand.model?.length > 0 ? (
                                                    brand.model.map((m, i) => (
                                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200 shadow-sm">
                                                            {m}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 italic">No models</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {brand.active ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Active</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openModal(brand)}
                                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors inline-block tooltip-trigger"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal / Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingBrand ? 'Edit Brand' : 'New Brand'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Name</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400"
                                        placeholder="e.g. Nike, Apple"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Attached Models (Comma Separated)</label>
                                    <input
                                        type="text"
                                        value={formData.models}
                                        onChange={(e) => setFormData({ ...formData, models: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-sm"
                                        placeholder="e.g. AirMax, Jordan, React"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
                                    <input
                                        type="checkbox"
                                        id="activeCheck"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <label htmlFor="activeCheck" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                                        Is this brand actively available?
                                    </label>
                                </div>
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
                                    {editingBrand ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Brands;
