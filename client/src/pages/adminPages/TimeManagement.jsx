import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiTrash2, FiPlus, FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi';

const TimeManagement = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [deletingSlot, setDeletingSlot] = useState(null);

    const initialFormState = { timename: '', starttime: '', endtime: '', lastOrderTime: '', active: 1 };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch Time Slots on component mount
    const fetchTimeSlots = async () => {
        try {
            setLoading(true);
            const res = await api.get('/time');
            if (res.data.success) {
                setTimeSlots(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load time slots');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const openModal = (slot = null) => {
        if (slot) {
            setEditingSlot(slot);
            setFormData({
                timename: slot.timename,
                starttime: slot.starttime,
                endtime: slot.endtime,
                lastOrderTime: slot.lastOrderTime,
                active: slot.active
            });
        } else {
            setEditingSlot(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingSlot(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.timename.trim()) return toast.warning('Time slot name is required');
        if (!formData.starttime) return toast.warning('Start time is required');
        if (!formData.endtime) return toast.warning('End time is required');
        if (!formData.lastOrderTime) return toast.warning('Last order time is required');

        try {
            setIsSubmitting(true);
            if (editingSlot) {
                await api.put(`/time/${editingSlot._id}`, formData);
                toast.success('Time slot updated successfully!');
            } else {
                await api.post('/time', formData);
                toast.success('Time slot created successfully!');
            }
            fetchTimeSlots();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingSlot) return;
        try {
            setIsSubmitting(true);
            await api.delete(`/time/${deletingSlot._id}`);
            toast.success('Time slot deleted successfully!');
            fetchTimeSlots();
            setIsDeleteModalOpen(false);
            setDeletingSlot(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete time slot');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (slot) => {
        try {
            const newStatus = slot.active === 1 ? 0 : 1;
            await api.put(`/time/${slot._id}`, { active: newStatus });
            toast.success(`Time slot ${newStatus === 1 ? 'activated' : 'deactivated'}`);
            fetchTimeSlots();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b border-gray-100 bg-white/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Time Slots Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure operational hours and order cut-off times for your delivery services.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <FiPlus className="w-5 h-5" />
                    New Time Slot
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                ) : timeSlots.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No time slots established yet.</p>
                        <button onClick={() => openModal()} className="mt-4 text-green-600 font-bold hover:underline">Establish your first slot</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {timeSlots.map((slot) => (
                            <div
                                key={slot._id}
                                className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:border-green-200 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(slot)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                                    <button onClick={() => { setDeletingSlot(slot); setIsDeleteModalOpen(true); }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${slot.active === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <FiClock className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-gray-800 text-xl tracking-tight">{slot.timename}</h4>
                                            {slot.active === 1 ? (
                                                <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-1.5 rounded bg-gray-50">Inactive</span>
                                            )}
                                        </div>

                                        <div className="mt-4 space-y-2.5">
                                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Window</span>
                                                <span className="text-sm font-bold text-gray-700">{slot.starttime} — {slot.endtime}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2.5 bg-green-50/30 rounded-xl border border-green-100/50">
                                                <span className="text-[10px] font-black uppercase text-green-600 tracking-[0.15em]">Cut-off</span>
                                                <span className="text-sm font-black text-green-700">{slot.lastOrderTime}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleStatus(slot)}
                                            className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all ${slot.active === 1 ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >
                                            {slot.active === 1 ? 'Disable Slot' : 'Enable Slot'}
                                        </button>
                                    </div>
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
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
                        <div className="bg-green-600 p-8 text-white relative flex justify-between items-center">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black tracking-tight">
                                    {editingSlot ? 'Refine Slot' : 'Configure Slot'}
                                </h3>
                                <p className="text-green-100 text-xs font-bold mt-1 uppercase tracking-widest opacity-80">Time Logistics Framework</p>
                            </div>
                            <button onClick={closeModal} className="relative z-10 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                            {/* Decorative background circle */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Slot Identifier</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.timename}
                                        onChange={(e) => setFormData({ ...formData, timename: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-300 font-bold text-gray-700 shadow-inner"
                                        placeholder="e.g. Morning Rush"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Start Time (24h)</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.starttime}
                                            onChange={(e) => setFormData({ ...formData, starttime: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">End Time (24h)</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.endtime}
                                            onChange={(e) => setFormData({ ...formData, endtime: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 items-end">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1 text-green-600 font-black">Last Order Cut-off</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.lastOrderTime}
                                            onChange={(e) => setFormData({ ...formData, lastOrderTime: e.target.value })}
                                            className="w-full px-6 py-4 bg-green-50 border-2 border-transparent rounded-2xl focus:border-green-500 focus:bg-white outline-none transition-all font-black text-green-700 shadow-inner"
                                        />
                                    </div>
                                    <div className="pb-1.5">
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <input
                                                type="checkbox"
                                                id="active-check"
                                                checked={formData.active === 1}
                                                onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                                                className="w-5 h-5 accent-green-600 cursor-pointer"
                                            />
                                            <label htmlFor="active-check" className="text-xs font-bold text-gray-600 cursor-pointer uppercase tracking-wider">Active Status</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-8 py-5 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] px-8 py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-600/30 disabled:opacity-70 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0"
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-3 border-green-200 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        editingSlot ? 'Commit Changes' : 'Publish Slot'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm relative z-10 p-10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] mb-6 flex items-center justify-center mx-auto transform -rotate-6 border-2 border-red-100 shadow-inner">
                            <FiTrash2 className="w-12 h-12" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Revoke Slot?</h3>
                        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
                            Abolishing "<span className="text-gray-900 font-black">{deletingSlot?.timename}</span>" is non-reversible. All associations will be severed.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-600/30 transition-all active:scale-95"
                            >
                                {isSubmitting ? '...' : 'Eradicate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeManagement;
