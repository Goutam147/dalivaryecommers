import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiTrash2, FiPlus, FiTag, FiCheck, FiAlertCircle } from 'react-icons/fi';

const Units = () => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [deletingUnit, setDeletingUnit] = useState(null);

    const initialFormState = { name: '', code: '', active: 1 };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch Units on component mount
    const fetchUnits = async () => {
        try {
            setLoading(true);
            const res = await api.get('/unit');
            if (res.data.success) {
                setUnits(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load units');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const openModal = (unit = null) => {
        if (unit) {
            setEditingUnit(unit);
            setFormData({
                name: unit.name,
                code: unit.code,
                active: unit.active
            });
        } else {
            setEditingUnit(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingUnit(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.warning('Unit name is required');
        if (!formData.code.trim()) return toast.warning('Unit code is required');

        try {
            setIsSubmitting(true);
            if (editingUnit) {
                await api.put(`/unit/${editingUnit._id}`, formData);
                toast.success('Unit updated successfully!');
            } else {
                await api.post('/unit', formData);
                toast.success('Unit created successfully!');
            }
            fetchUnits();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingUnit) return;
        try {
            setIsSubmitting(true);
            await api.delete(`/unit/${deletingUnit._id}`);
            toast.success('Unit deleted successfully!');
            fetchUnits();
            setIsDeleteModalOpen(false);
            setDeletingUnit(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete unit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (unit) => {
        try {
            const newStatus = unit.active === 1 ? 0 : 1;
            await api.put(`/unit/${unit._id}`, { active: newStatus });
            toast.success(`Unit ${newStatus === 1 ? 'activated' : 'deactivated'}`);
            fetchUnits();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b border-gray-100 bg-white/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Measurement Units</h2>
                    <p className="text-gray-500 text-sm mt-1">Define units like KG, GM, LTR, or Pieces for your products.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Unit
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                ) : units.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-gray-500 text-lg font-medium">No units found. Add your first measurement unit!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {units.map((unit) => (
                            <div
                                key={unit._id}
                                className="group relative flex items-center justify-between p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-green-50/50 hover:border-green-200 hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${unit.active === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                        <FiTag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{unit.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">{unit.code}</span>
                                            <span className={`w-2 h-2 rounded-full ${unit.active === 1 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => toggleStatus(unit)}
                                        className={`p-2 rounded-xl transition-colors ${unit.active === 1 ? 'text-orange-500 hover:bg-orange-100' : 'text-green-500 hover:bg-green-100'}`}
                                        title={unit.active === 1 ? "Deactivate" : "Activate"}
                                    >
                                        <FiCheck className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => openModal(unit)}
                                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-xl transition-colors"
                                        title="Edit"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setDeletingUnit(unit); setIsDeleteModalOpen(true); }}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex justify-between items-center p-8 border-b border-gray-100 pb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                                    {editingUnit ? 'Refine Unit' : 'Establish Unit'}
                                </h3>
                                <p className="text-gray-400 text-xs font-semibold mt-1 uppercase tracking-widest">Global Configuration</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full p-2.5 hover:bg-gray-100">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Formal Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-300 font-bold text-gray-700"
                                    placeholder="e.g. Kilogram"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Unit Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-300 font-bold text-gray-700 text-center uppercase"
                                        placeholder="e.g. KG"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Initial Status</label>
                                    <select
                                        value={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: Number(e.target.value) })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer text-center"
                                    >
                                        <option value={1}>Active</option>
                                        <option value={0}>Disabled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-lg shadow-green-600/20 disabled:opacity-70 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:translate-y-0"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-green-200 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        editingUnit ? 'Update Record' : 'Save Details'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl mb-6 flex items-center justify-center mx-auto transform -rotate-12 border-2 border-red-100">
                            <FiTrash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">Eliminate Unit?</h3>
                        <p className="text-gray-400 mb-8 font-medium">
                            Deleting "<span className="text-gray-900 font-bold">{deletingUnit?.name}</span>" is a permanent action. All references will be lost.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all"
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

export default Units;
