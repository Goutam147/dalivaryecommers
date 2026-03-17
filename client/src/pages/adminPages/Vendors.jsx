import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const initialForm = {
        name: '',
        address: '',
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
        setValidationErrors({});
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({
                name: vendor.name,
                address: vendor.address || '',
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
        setValidationErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            setIsSubmitting(true);

            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('address', formData.address);

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
            if (error.response?.data?.errors) {
                const errorsDict = {};
                error.response.data.errors.forEach(err => {
                    errorsDict[err.field] = err.message;
                });
                setValidationErrors(errorsDict);
                toast.error('Please fix the validation errors below.');
            } else {
                toast.error(error.response?.data?.message || 'Vendor creation failed!');
            }
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                            {vendor.address}
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

                    <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor'}
                            </h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form id="vendorForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar text-left">

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-green-500/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400`} placeholder="e.g. Fresh Farms Corp" />
                                    {validationErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner / Contact Person</label>
                                    <input type="text" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.owner ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-green-500/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400`} placeholder="John Doe" />
                                    {validationErrors.owner && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.owner}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Numbers</label>
                                        <input type="text" value={formData.phones} onChange={(e) => setFormData({ ...formData, phones: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.phone ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-green-500/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400`} placeholder="e.g. 555-1234, 555-5678" />
                                        {validationErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number</label>
                                        <input type="text" value={formData.gstNo} onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.gstNo ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-green-500/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 text-sm font-mono`} placeholder="22AAAAA0000A1Z5" />
                                        {validationErrors.gstNo && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.gstNo}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Linked Email</label>
                                    <input type="text" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-green-500/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400`} placeholder="contact@freshfarms.com" />
                                    {validationErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address</label>
                                    <textarea rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.address ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-green-500/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 resize-none`} placeholder="123 Farm Lane, Agriculture City, AP 500001" />
                                    {validationErrors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.address}</p>}
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
