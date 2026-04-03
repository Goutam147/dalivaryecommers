import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Chips } from 'primereact/chips';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);

    // Brand specific form structure. models is an array for Chips component
    const [formData, setFormData] = useState({ name: '', active: true, models: [] });

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
                models: brand.model || []
            });
        } else {
            setEditingBrand(null);
            setFormData({ name: '', active: true, models: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', active: true, models: [] });
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

            // Append each model to FormData from our array
            if (formData.models && formData.models.length > 0) {
                formData.models.forEach(m => payload.append('model', m));
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

    const infoTemplate = (row) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                <FiImage className="text-xl" />
            </div>
            <span className="font-bold text-black">{row.name}</span>
        </div>
    );

    const modelsTemplate = (row) => (
        <div className="flex flex-wrap gap-1.5">
            {row.model?.length > 0 ? (
                row.model.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 rounded text-sm font-bold text-gray-700">
                        {m}
                    </div>
                ))
            ) : (
                <span className="text-gray-400 italic text-xs">No models found</span>
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
            <h5 className="m-0 text-xl font-bold text-gray-900 tracking-tight">Brand Directory</h5>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={() => setGlobalFilter('')} className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 text-xs" />
                <span className="relative">
                    <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Keyword Search" className="pl-10 pr-4 py-2 bg-white border border-gray-300 shadow-sm focus:border-color1 outline-none text-gray-900 font-medium rounded-md w-full text-xs" />
                </span>
                <Button label="New Brand" icon="pi pi-plus" className="bg-color1 border-none py-2 px-6 rounded-md shadow-sm font-bold text-white flex items-center justify-center gap-2 text-xs" onClick={() => openModal()} />
            </div>
        </div>
    );

    const slTemplate = (data, options) => {
        return <span className="text-xs font-medium text-gray-600">{options.rowIndex + 1}</span>
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    value={brands}
                    paginator
                    rows={15}
                    loading={loading}
                    globalFilter={globalFilter}
                    header={header}
                    showGridlines
                    responsiveLayout="stack"
                    className="p-datatable-brands"
                    emptyMessage={
                        <div className="py-20 text-center">
                            <i className="pi pi-box text-6xl text-gray-200 mb-4" />
                            <p className="text-gray-500 font-bold text-sm">No Brands Found. Create your first one!</p>
                        </div>
                    }
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                >
                    <Column header="Sl" body={slTemplate} className="w-16 text-center" />
                    <Column header="Brand Name" body={infoTemplate} sortable field="name" className="font-bold text-gray-800" />
                    <Column header="Associated Models" body={modelsTemplate} />
                    <Column header="Status" body={statusBodyTemplate} sortable field="active" className="text-center" />
                    <Column header="Action" body={actionTemplate} className="text-center w-24" />
                </DataTable>
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
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-color1/10 focus:border-color1 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-900"
                                        placeholder="e.g. Nike, Apple"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#3b82f6] mb-3">Tags ( These tags help you in search Result )</label>
                                    <Chips
                                        value={formData.models}
                                        onChange={(e) => setFormData({ ...formData, models: e.value })}
                                        placeholder="Type and press enter..."
                                        className="w-full"
                                        pt={{
                                            container: { className: 'w-full min-h-[60px] p-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-4 focus-within:ring-color1/10 focus-within:border-color1 transition-all' },
                                            token: { className: 'bg-gray-200 text-gray-700 rounded px-3 py-1.5 flex items-center gap-2 m-1 font-bold text-sm border border-gray-300' },
                                            tokenLabel: { className: 'text-gray-800' },
                                            removeTokenIcon: { className: 'text-blue-500 hover:text-blue-700 cursor-pointer scale-110' }
                                        }}
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
                                    <input
                                        type="checkbox"
                                        id="activeCheck"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-5 h-5 text-color1 bg-white border-gray-300 rounded focus:ring-color1"
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
                                    className="px-6 py-2.5 bg-color1 hover:bg-color2 text-white font-bold rounded-xl shadow-sm shadow-color1/20 disabled:opacity-70 flex items-center gap-2 transition-all"
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
