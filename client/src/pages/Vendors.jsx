import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    // Complex nested vendor form state
    const initialForm = {
        name: '',
        address: { line1: '', line2: '', city: '', pin: '', location: '' },
        phones: '', // String to be comma parsed
        email: '',
        gstNo: '',
        owner: '',
        active: true
    };
    const [formData, setFormData] = useState(initialForm);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/vendor');
            if (res.data.success) {
                setVendors(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const openModal = (vendor = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({
                name: vendor.name,
                address: vendor.address || { line1: '', line2: '', city: '', pin: '', location: '' },
                phones: vendor.phone ? vendor.phone.join(', ') : '',
                email: vendor.email || '',
                gstNo: vendor.gstNo || '',
                owner: vendor.owner || '',
                active: vendor.active ?? true
            });
        } else {
            setEditingVendor(null);
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialForm);
        setEditingVendor(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.warning('Vendor name is required');
        if (!formData.address.line1.trim() || !formData.address.city.trim() || !formData.address.pin) {
            return toast.warning('City, Pin, and Address Line 1 are required');
        }

        try {
            setIsSubmitting(true);

            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('address.line1', formData.address.line1);
            if (formData.address.line2) payload.append('address.line2', formData.address.line2);
            payload.append('address.city', formData.address.city);
            payload.append('address.pin', formData.address.pin);
            if (formData.address.location) payload.append('address.location', formData.address.location);

            if (formData.email) payload.append('email', formData.email);
            if (formData.gstNo) payload.append('gstNo', formData.gstNo);
            if (formData.owner) payload.append('owner', formData.owner);
            payload.append('active', formData.active);

            // Parse phones
            if (formData.phones.trim()) {
                const phoneArray = formData.phones.split(',').map(m => m.trim()).filter(Boolean);
                phoneArray.forEach(p => payload.append('phone', p));
            }

            if (editingVendor) {
                await api.put(`/vendor/${editingVendor._id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Vendor profile updated!');
            } else {
                await api.post('/vendor', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Vendor partnered successfully!');
            }

            fetchVendors();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Vendor creation failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b border-gray-100 bg-white/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Vendor Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage external suppliers, owners, and contact details.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 transform active:scale-95"
                >
                    <FiCheck className="w-4 h-4" />
                    Register Vendor
                </button>
            </div>

            <div className="flex-1 p-6 lg:p-8 overflow-x-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-gray-500 text-lg font-medium">No Vendors Registered yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {vendors.map((vendor) => (
                            <div key={vendor._id} className="bg-white border text-left border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">

                                {/* Status Badge & Actions */}
                                <div className="absolute top-6 right-6 flex items-center gap-2">
                                    <button
                                        onClick={() => openModal(vendor)}
                                        className="p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <div className={`w-3 h-3 rounded-full border-2 ${vendor.active ? 'bg-green-500 border-green-200' : 'bg-red-500 border-red-200'}`} title={vendor.active ? 'Active' : 'Inactive'} />
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl flex items-center justify-center text-green-600 font-bold text-xl border border-green-100 shadow-inner">
                                        {vendor.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 leading-tight pr-10">{vendor.name}</h3>
                                        <p className="text-sm font-medium text-gray-500">{vendor.owner || 'No Owner Listed'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                                    <div className="flex items-start gap-3 text-gray-600">
                                        <FiMapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                        <span className="leading-tight">
                                            {vendor.address?.line1}, {vendor.address?.city} {vendor.address?.pin}
                                        </span>
                                    </div>
                                    {vendor.phone && vendor.phone.length > 0 && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FiPhone className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="truncate">{vendor.phone[0]} {vendor.phone.length > 1 && `(+${vendor.phone.length - 1} more)`}</span>
                                        </div>
                                    )}
                                    {vendor.email && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FiMail className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="truncate">{vendor.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Complex Vendor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

                    <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor'}
                            </h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form id="vendorForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400" placeholder="e.g. Fresh Farms Corp" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner / Contact Person</label>
                                    <input type="text" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number</label>
                                    <input type="text" value={formData.gstNo} onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-sm font-mono" placeholder="22AAAAA0000A1Z5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Linked Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400" placeholder="contact@freshfarms.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Numbers (Comma separated)</label>
                                    <input type="text" value={formData.phones} onChange={(e) => setFormData({ ...formData, phones: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all placeholder-gray-400" placeholder="e.g. 555-1234, 555-5678" />
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-4 tracking-wide uppercase">Location Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Address Line 1</label>
                                        <input type="text" required value={formData.address.line1} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Address Line 2</label>
                                        <input type="text" value={formData.address.line2} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line2: e.target.value } })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                                        <input type="text" required value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">PIN / Zip Code</label>
                                        <input type="number" required value={formData.address.pin} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pin: e.target.value } })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                                <input type="checkbox" id="vendorActive" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500" />
                                <label htmlFor="vendorActive" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">Vendor is authorized and active</label>
                            </div>
                        </form>

                        {/* Footer Actions */}
                        <div className="p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all">Cancel</button>
                            <button type="submit" form="vendorForm" disabled={isSubmitting} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm shadow-green-600/20 disabled:opacity-70 flex items-center gap-2 transition-all">
                                {isSubmitting && <div className="w-4 h-4 border-2 border-green-200 border-t-white rounded-full animate-spin"></div>}
                                {editingVendor ? 'Save Changes' : 'Register Vendor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
