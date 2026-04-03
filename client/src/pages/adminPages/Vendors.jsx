import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');

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

    const infoTemplate = (row) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-color7 flex items-center justify-center text-color2 font-bold border border-color1/20 shadow-inner">
                {row.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-black text-sm">{row.name}</span>
                <span className="text-[10px] text-gray-500 font-semibold mt-0.5">{row.owner || 'No Owner Listed'}</span>
            </div>
        </div>
    );

    const contactTemplate = (row) => (
        <div className="flex flex-col gap-1">
            {row.phone && row.phone.length > 0 && (
                <div className="flex items-center gap-2 text-black">
                    <FiPhone className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs font-bold">{row.phone[0]} {row.phone.length > 1 && `(+${row.phone.length - 1})`}</span>
                </div>
            )}
            {row.email && (
                <div className="flex items-center gap-2 text-black">
                    <FiMail className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs font-bold truncate max-w-[150px]">{row.email}</span>
                </div>
            )}
        </div>
    );

    const statusBodyTemplate = (row) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none inline-block ${row.active
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            {row.active ? 'Active' : 'Inactive'}
        </span>
    );

    const slTemplate = (data, options) => {
        return <span className="text-xs font-medium text-gray-600">{options.rowIndex + 1}</span>
    };

    const actionTemplate = (row) => (
        <div className="flex items-center justify-center gap-2">
            <button
                onClick={() => openModal(row)}
                className="w-7 h-7 rounded bg-green-700 hover:bg-green-800 text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Edit Entry"
            >
                <FiEdit2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );

    const header = (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4">
            <h5 className="m-0 text-xl font-bold text-gray-900 tracking-tight">Vendor Directory</h5>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={() => setGlobalFilter('')} className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 text-xs" />
                <span className="relative">
                    <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Keyword Search" className="pl-10 pr-4 py-2 bg-white border border-gray-300 shadow-sm focus:border-color1 outline-none text-gray-900 font-medium rounded-md w-full text-xs" />
                </span>
                <Button label="New Vendor" icon="pi pi-plus" className="bg-color1 border-none py-2 px-6 rounded-md shadow-sm font-bold text-white flex items-center justify-center gap-2 text-xs" onClick={() => openModal()} />
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    value={vendors}
                    paginator
                    rows={15}
                    loading={loading}
                    globalFilter={globalFilter}
                    header={header}
                    showGridlines
                    responsiveLayout="stack"
                    className="p-datatable-vendors"
                    emptyMessage={
                        <div className="py-20 text-center">
                            <i className="pi pi-box text-6xl text-gray-200 mb-4" />
                            <p className="text-gray-500 font-bold text-sm">No Vendors Registered yet.</p>
                        </div>
                    }
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    paginatorClassName="border-t border-gray-50 py-4"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                >
                    <Column header="Sl" body={slTemplate} className="w-16 text-center" />
                    <Column header="Vendor Profile" body={infoTemplate} sortable field="name" />
                    <Column header="Contact Details" body={contactTemplate} />
                    <Column header="Address" field="address" style={{ maxWidth: '250px' }} className="truncate font-medium text-xs text-black" />
                    <Column header="Status" body={statusBodyTemplate} sortable field="active" className="text-center" />
                    <Column header="Action" body={actionTemplate} className="text-center w-24" />
                </DataTable>
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
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-color1/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-900`} placeholder="e.g. Fresh Farms Corp" />
                                    {validationErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner / Contact Person</label>
                                    <input type="text" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.owner ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-color1/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-900`} placeholder="John Doe" />
                                    {validationErrors.owner && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.owner}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Numbers</label>
                                        <input type="text" value={formData.phones} onChange={(e) => setFormData({ ...formData, phones: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.phone ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-color1/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-900`} placeholder="e.g. 555-1234, 555-5678" />
                                        {validationErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number</label>
                                        <input type="text" value={formData.gstNo} onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.gstNo ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-color1/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 text-sm font-mono text-gray-900`} placeholder="22AAAAA0000A1Z5" />
                                        {validationErrors.gstNo && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.gstNo}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Linked Email</label>
                                    <input type="text" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-color1/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-900`} placeholder="contact@freshfarms.com" />
                                    {validationErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address</label>
                                    <textarea rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`w-full px-4 py-2.5 bg-gray-50 border ${validationErrors.address ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-color1/10'} rounded-xl focus:ring-4 focus:bg-white outline-none transition-all placeholder-gray-400 resize-none text-gray-900`} placeholder="123 Farm Lane, Agriculture City, AP 500001" />
                                    {validationErrors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.address}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                                <input type="checkbox" id="vendorActive" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-5 h-5 text-color1 bg-white border-gray-300 rounded focus:ring-color1" />
                                <label htmlFor="vendorActive" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">Vendor is authorized and active</label>
                            </div>
                        </form>

                        <div className="p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all">Cancel</button>
                            <button type="submit" form="vendorForm" disabled={isSubmitting} className="px-6 py-2.5 bg-color1 hover:bg-color2 text-white font-bold rounded-xl shadow-sm shadow-color1/20 disabled:opacity-70 flex items-center gap-2 transition-all">
                                {isSubmitting && <div className="w-4 h-4 border-2 border-color2 border-t-white rounded-full animate-spin"></div>}
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
