import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';

const SubCategories = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoryTypes, setCategoryTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [visible, setVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [formData, setFormData] = useState({
        subCategoryName: '',
        subCategoryImage: null,
        mainCategoryId: '',
        categoryType: [], // Array of category IDs
        active: true
    });
    const [imagePreview, setImagePreview] = useState(null);

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
            toast.error('Failed to load catalog data');
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
                mainCategoryId: sub.mainCategory?.mainCategoryId?._id || sub.mainCategory?.mainCategoryId || '',
                categoryType: sub.categoryType?.map(t => t.categoryId?._id || t.categoryId) || [],
                active: sub.active !== undefined ? sub.active : true
            });
            setImagePreview(sub.subCategoryImage?.path?.medium ? `${import.meta.env.VITE_SERVER_URL}${sub.subCategoryImage.path.medium}` : null);
        } else {
            setEditingSub(null);
            setFormData({
                subCategoryName: '',
                subCategoryImage: null,
                mainCategoryId: '',
                categoryType: [],
                active: true
            });
            setImagePreview(null);
        }
        setVisible(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, subCategoryImage: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!formData.subCategoryName.trim()) return toast.warning('Name is required');
        if (!formData.mainCategoryId) return toast.warning('Select a main category');
        if (formData.categoryType.length === 0) return toast.warning('Select mapping types');

        try {
            setIsSubmitting(true);
            const selectedCat = categories.find(c => c._id === formData.mainCategoryId);
            const mainCategory = { name: selectedCat?.name, mainCategoryId: formData.mainCategoryId };

            const selectedTypes = categoryTypes
                .filter(t => formData.categoryType.includes(t._id))
                .map(t => ({ name: t.name, categoryId: t._id }));

            const payload = new FormData();
            payload.append('subCategoryName', formData.subCategoryName);
            if (formData.subCategoryImage) payload.append('files', formData.subCategoryImage);
            payload.append('mainCategory', JSON.stringify(mainCategory));
            payload.append('categoryType', JSON.stringify(selectedTypes));
            payload.append('active', formData.active);

            if (editingSub) {
                await api.put(`/sub-category/${editingSub._id}`, payload);
                toast.success('Updated successfully');
            } else {
                await api.post('/sub-category', payload);
                toast.success('Created successfully');
            }
            fetchData();
            setVisible(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (data) => {
        if (!window.confirm('Delete this sub-category?')) return;
        try {
            await api.delete(`/sub-category/${data._id}`);
            toast.success('Deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // Templates
    const infoTemplate = (row) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                <FiImage className="text-xl" />
            </div>
            <span className="font-bold text-black">{row.subCategoryName}</span>
        </div>
    );

    const mainCatTemplate = (row) => (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-color1" />
            <span className="text-sm font-bold text-black">{row.mainCategory?.name}</span>
        </div>
    );

    const typesTemplate = (row) => (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-black">{row.categoryType?.length || 0} Unified Types</span>
            <div className="flex flex-wrap gap-1">
                {row.categoryType?.slice(0, 2).map((t, i) => (
                    <Tag key={i} value={t.name} className="text-[9px] font-bold bg-gray-100 text-gray-600 border-none" />
                ))}
                {row.categoryType?.length > 2 && (
                    <Tag value={`+${row.categoryType.length - 2}`} className="text-[9px] font-bold bg-color7 text-color1 border-none" />
                )}
            </div>
        </div>
    );

    const slTemplate = (data, options) => {
        return <span className="text-xs font-medium text-gray-600">{options.rowIndex + 1}</span>
    };

    const actionTemplate = (row) => (
        <div className="flex justify-center gap-2">
            <button
                onClick={() => openModal(row)}
                className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Edit Entry"
            >
                <i className="pi pi-pencil text-[10px]" />
            </button>
            <button
                onClick={() => handleDelete(row)}
                className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Delete Entry"
            >
                <i className="pi pi-trash text-[10px]" />
            </button>
        </div>
    );



    const header = (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4">
            <h5 className="m-0 text-xl font-bold text-gray-900 tracking-tight">Category Nexus</h5>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={() => setGlobalFilter('')} className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 text-xs" />
                <span className="relative">
                    <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Keyword Search" className="pl-10 pr-4 py-2 bg-white border border-gray-300 shadow-sm focus:border-color1 outline-none text-gray-900 font-medium rounded-md w-full text-xs" />
                </span>
                <Button label="New Cluster" icon="pi pi-plus" className="bg-color1 border-none py-2 px-6 rounded-md shadow-sm font-bold text-white flex items-center justify-center gap-2 text-xs" onClick={() => openModal()} />
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    value={subCategories}
                    paginator
                    rows={15}
                    loading={loading}
                    globalFilter={globalFilter}
                    header={header}
                    showGridlines
                    responsiveLayout="stack"
                    className="p-datatable-subcategories"
                    emptyMessage={
                        <div className="py-20 text-center">
                            <i className="pi pi-box text-6xl text-gray-100 mb-4" />
                            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Synchronizing Catalog State...</p>
                        </div>
                    }
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    paginatorClassName="border-t border-gray-50 py-4"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                >
                    <Column header="Sl" body={slTemplate} className="w-16 text-center" />
                    <Column header="Identity Cluster" body={infoTemplate} sortable field="subCategoryName" />
                    <Column header="Parent Hierarchy" body={mainCatTemplate} sortable field="mainCategory.name" />
                    <Column header="Unified Mappings" body={typesTemplate} />
                    <Column header="Action" body={actionTemplate} className="text-center w-32" />
                </DataTable>
            </div>

            <Dialog
                header={editingSub ? 'Refine Catalog Node' : 'Initialize Catalog Cluster'}
                visible={visible}
                style={{ width: '90vw', maxWidth: '650px' }}
                onHide={() => setVisible(false)}
                className="rounded-[40px] overflow-hidden"
                contentClassName="p-10 space-y-10"
                modal
                blockScroll
                footer={
                    <div className="flex justify-end gap-4 p-8 bg-gray-50/50 border-t border-gray-100">
                        <Button label="Discard" text onClick={() => setVisible(false)} className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-6" />
                        <Button
                            label={editingSub ? 'Synchronize Data' : 'Initialize Node'}
                            icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-color1 border-none px-10 py-4 rounded-2xl shadow-2xl shadow-color1/30 font-black text-[10px] uppercase tracking-[0.2em]"
                        />
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Node Label</label>
                        <InputText
                            value={formData.subCategoryName}
                            onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                            placeholder="e.g. Skin Care"
                            className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl font-bold text-sm focus:border-color1 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Nexus</label>
                        <Dropdown
                            value={formData.mainCategoryId}
                            options={categories}
                            onChange={(e) => setFormData({ ...formData, mainCategoryId: e.value })}
                            optionLabel="name"
                            optionValue="_id"
                            placeholder="Select Category"
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl font-bold text-sm focus:border-color1 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex justify-between items-center">
                        Associated Type Fragments
                        <Tag value={formData.categoryType.length} className="bg-color7 text-color1 font-black px-2.5 rounded-full" />
                    </label>
                    <MultiSelect
                        value={formData.categoryType}
                        options={categoryTypes}
                        onChange={(e) => setFormData({ ...formData, categoryType: e.value })}
                        optionLabel="name"
                        optionValue="_id"
                        placeholder="Map fragment types..."
                        filter
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl font-bold text-sm focus:border-color1 shadow-sm"
                        display="chip"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Manifest</label>
                    <div className="p-8 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-6 group hover:border-color1/30 transition-all cursor-pointer overflow-hidden">
                        {imagePreview ? (
                            <div className="relative group">
                                <img src={imagePreview} className="w-40 h-40 rounded-[2.5rem] object-cover shadow-2xl ring-4 ring-white" />
                                <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <i className="pi pi-pencil text-white text-2xl" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border border-gray-100 group-hover:scale-110 transition-transform">
                                <i className="pi pi-cloud-upload text-4xl text-color1" />
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="file-upload" />
                        <label htmlFor="file-upload" className="text-[10px] font-black text-gray-400 group-hover:text-color1 uppercase tracking-widest cursor-pointer transition-colors">
                            Initialize Visual Data
                        </label>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default SubCategories;
