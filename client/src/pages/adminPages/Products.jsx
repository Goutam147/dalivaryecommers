import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiImage, FiEye, FiSearch, FiFilter, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');

    // Relational Data for Dropdowns (Used in Edit Modal)
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [units, setUnits] = useState([]);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);

    // Form State for Edit
    const initialFormState = {
        name: '',
        description: '',
        title: '',
        categoryTypeId: null,
        brandId: null,
        expectedTime: '',
        returnPolicy: '',
        active: 1,
        setImg: 'combine',
        types: [],
        charges: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Variant-specific images
    const [variantImageFiles, setVariantImageFiles] = useState([]);
    const [variantImagePreviews, setVariantImagePreviews] = useState([]);

    // Common Charge Names for Dropdown
    const chargeOptions = [
        "Delivery Charge",
        "Packing Charge",
        "GST",
        "Service Charge",
        "VAT",
        "CGST",
        "SGST",
        "IGST",
        "Other"
    ];

    // Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, brandRes, unitRes] = await Promise.all([
                api.get('/product'),
                api.get('/category-type'),
                api.get('/brand'),
                api.get('/unit')
            ]);

            if (prodRes.data.success) setProducts(prodRes.data.data);
            if (catRes.data.success) {
                setCategories(catRes.data.data.map(c => ({ value: c._id, label: c.name })));
            }
            if (brandRes.data.success) {
                setBrands(brandRes.data.data.map(b => ({ value: b._id, label: b.name })));
            }
            if (unitRes.data.success) {
                setUnits(unitRes.data.data.map(u => ({ value: u._id, label: u.code || u.name })));
            }
        } catch (error) {
            toast.error('Failed to load required data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openEditModal = (product) => {
        setEditingProduct(product);

        setFormData({
            name: product.name || '',
            description: product.description || '',
            title: product.title ? product.title.join(', ') : '',
            categoryTypeId: product.categoryTypeId ? { value: product.categoryTypeId._id || product.categoryTypeId, label: product.categoryTypeId.name || 'Selected' } : null,
            brandId: product.brandId ? { value: product.brandId._id || product.brandId, label: product.brandId.name || 'Selected' } : null,
            expectedTime: product.expectedTime || '',
            returnPolicy: product.returnPolicy || 'no return',
            active: product.active ?? 1,
            setImg: product.setImg || 'combine',
            types: product.types && product.types.length > 0
                ? product.types.map(t => ({
                    ...t,
                    unitId: t.unitId?._id || t.unitId || '',
                    info: t.info || ''
                }))
                : [],
            charges: product.charges && product.charges.length > 0
                ? product.charges.map(c => ({ ...c }))
                : [],
            images: product.images ? product.images.map(img => img._id) : []
        });

        // Initialize variant image previews with existing images
        if (product.types) {
            const initialFiles = product.types.map(() => []);
            const initialPreviews = product.types.map(t =>
                t.images ? t.images.map(img => `${import.meta.env.VITE_SERVER_URL}${img.path?.medium || img.path?.original}`) : []
            );
            setVariantImageFiles(initialFiles);
            setVariantImagePreviews(initialPreviews);
        }

        setThumbnailPreview(product.thumbnail?.path?.medium ? `${import.meta.env.VITE_SERVER_URL}${product.thumbnail.path.medium}` : null);
        setImagePreviews(product.images ? product.images.map(img => `${import.meta.env.VITE_SERVER_URL}${img.path?.medium || img.path?.original}`) : []);
        setThumbnailFile(null);
        setImageFiles([]);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    const openDetailsModal = (product) => {
        setViewingProduct(product);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setViewingProduct(null);
    };

    const handleTypeChange = (index, field, value) => {
        const newTypes = [...formData.types];
        newTypes[index][field] = value;
        setFormData({ ...formData, types: newTypes });
    };

    const addTypeRow = () => {
        setFormData({
            ...formData,
            types: [...formData.types, { qty: 1, unitId: '', price: 0, mrp: 0, description: '', maxOrder: 1, verified: false, veg: false, info: '', images: [] }]
        });
        setVariantImageFiles([...variantImageFiles, []]);
        setVariantImagePreviews([...variantImagePreviews, []]);
    };

    const removeTypeRow = (index) => {
        if (formData.types.length <= 1) return toast.warning("Product must have at least one variation type.");
        const newTypes = formData.types.filter((_, i) => i !== index);
        setFormData({ ...formData, types: newTypes });
        setVariantImageFiles(variantImageFiles.filter((_, i) => i !== index));
        setVariantImagePreviews(variantImagePreviews.filter((_, i) => i !== index));
    };

    const handleVariantImagesChange = (index, e) => {
        const files = Array.from(e.target.files);
        const newFiles = [...variantImageFiles];
        newFiles[index] = [...newFiles[index], ...files];
        setVariantImageFiles(newFiles);

        const previews = files.map(file => URL.createObjectURL(file));
        const newPreviews = [...variantImagePreviews];
        newPreviews[index] = [...newPreviews[index], ...previews];
        setVariantImagePreviews(newPreviews);
    };

    const removeVariantImage = (variantIndex, imageIndex) => {
        // If it's an existing image (string URL), we might need to handle deletion in DB or just UI
        // For now, let's just handle it in UI state. 
        // Note: If they remove an existing image, it won't be sent back in the images array if we were tracking IDs there.
        // But for variants, the backend currently replaces images if new ones are uploaded for that index? 
        // No, backend replaces all images for that index if `images_${index}` is present? 
        // Let's re-verify backend logic.

        const newFiles = [...variantImageFiles];
        // Only filter if it was a file (not an existing string path)
        // Wait, variantImageFiles only stores NEW files. variantImagePreviews stores both existing URLs and new Blob URLs.

        // Actually, let's simplify: if they remove an existing image, we need to remove it from t.images in formData.types
        const newTypes = [...formData.types];
        if (newTypes[variantIndex].images && imageIndex < newTypes[variantIndex].images.length) {
            newTypes[variantIndex].images.splice(imageIndex, 1);
            setFormData({ ...formData, types: newTypes });

            const newPreviews = [...variantImagePreviews];
            newPreviews[variantIndex].splice(imageIndex, 1);
            setVariantImagePreviews(newPreviews);
        } else {
            // It's a new file
            const newFileIndex = imageIndex - (newTypes[variantIndex].images ? newTypes[variantIndex].images.length : 0);
            const newFilesArr = [...variantImageFiles];
            newFilesArr[variantIndex] = newFilesArr[variantIndex].filter((_, i) => i !== newFileIndex);
            setVariantImageFiles(newFilesArr);

            const newPreviews = [...variantImagePreviews];
            newPreviews[variantIndex].splice(imageIndex, 1);
            setVariantImagePreviews(newPreviews);
        }
    };

    const handleChargeChange = (index, field, value) => {
        const newCharges = [...formData.charges];
        newCharges[index][field] = value;
        setFormData({ ...formData, charges: newCharges });
    };

    const handleDeleteGalleryImage = async (productId, imageId) => {
        if (!window.confirm("Are you sure you want to remove this image from the gallery?")) return;

        try {
            const res = await api.delete(`/product/${productId}/images/${imageId}`);
            if (res.data.success) {
                toast.success("Image removed");
                // Update both lists to reflect change
                setViewingProduct(res.data.data);
                fetchData(); // Refresh the main table
            }
        } catch (error) {
            toast.error("Failed to remove image");
        }
    };

    const addChargeRow = () => {
        setFormData({
            ...formData,
            charges: [...formData.charges, { name: '', amount: '', type: 'fixed' }]
        });
    };

    const removeChargeRow = (index) => {
        const newCharges = formData.charges.filter((_, i) => i !== index);
        setFormData({ ...formData, charges: newCharges });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            const payloadObject = {
                ...formData,
                charges: formData.charges
                    .filter(c => c.name.trim() !== '' && c.amount !== '')
                    .map(c => ({
                        ...c,
                        amount: Number(c.amount)
                    })),
                categoryTypeId: formData.categoryTypeId ? formData.categoryTypeId.value : null,
                brandId: formData.brandId ? formData.brandId.value : null,
                types: formData.types.map(t => ({
                    ...t,
                    qty: Number(t.qty),
                    price: Number(t.price),
                    mrp: Number(t.mrp),
                    maxOrder: Number(t.maxOrder)
                })),
                images: formData.images || []
            };

            const payloadData = new FormData();
            payloadData.append('data', JSON.stringify(payloadObject));

            if (thumbnailFile) {
                payloadData.append('thumbnail', thumbnailFile);
            }

            if (formData.setImg === 'split') {
                variantImageFiles.forEach((files, index) => {
                    files.forEach(file => {
                        payloadData.append(`images_${index}`, file);
                    });
                });
            } else {
                if (imageFiles && imageFiles.length > 0) {
                    imageFiles.forEach(file => {
                        payloadData.append('images', file);
                    });
                }
            }

            await api.put(`/product/${editingProduct._id}`, payloadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Product updated successfully!');
            fetchData();
            closeEditModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingProduct) return;
        try {
            setIsSubmitting(true);
            await api.delete(`/product/${deletingProduct._id}`);
            toast.success('Product deleted successfully');
            fetchData();
            setIsDeleteModalOpen(false);
            setDeletingProduct(null);
        } catch (error) {
            toast.error('Failed to delete product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2";
    const inputStyle = "w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-color1 focus:border-color1 outline-none text-sm transition-all";

    const productTemplate = (row) => (
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                {row.thumbnail?.path?.thumbnail ? (
                    <img src={`${import.meta.env.VITE_SERVER_URL}${row.thumbnail.path.thumbnail}`} className="w-full h-full object-cover" />
                ) : <FiImage className="w-full h-full p-3 text-gray-300" />}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{row.name}</span>
                <span className="text-xs text-gray-400 truncate max-w-[250px]">{row.description || 'No description'}</span>
            </div>
        </div>
    );

    const categoryTemplate = (row) => (
        <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">{row.brandId?.name || 'No Brand'}</span>
            <span className="text-[10px] font-bold text-color1 bg-color7 px-2 py-0.5 rounded border border-color1/20 w-fit mt-1 uppercase">{row.categoryTypeId?.name || 'Uncategorized'}</span>
        </div>
    );

    const variantsTemplate = (row) => (
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100 leading-none">
            {row.types?.length || 0} ITEMS
        </span>
    );

    const statusTemplate = (row) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${row.active === 1
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${row.active === 1 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {row.active === 1 ? 'Active' : 'Draft'}
        </span>
    );

    const slTemplate = (data, options) => {
        return <span className="text-xs font-medium text-gray-600">{options.rowIndex + 1}</span>
    };

    const actionTemplate = (row) => (
        <div className="flex items-center justify-center gap-1.5">
            <button onClick={() => openDetailsModal(row)} className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-sm active:scale-95" title="View Info"><FiEye className="w-3.5 h-3.5" /></button>
            <button onClick={() => openEditModal(row)} className="w-7 h-7 rounded bg-green-700 hover:bg-green-800 text-white flex items-center justify-center transition-all shadow-sm active:scale-95" title="Quick Edit"><FiEdit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => { setDeletingProduct(row); setIsDeleteModalOpen(true); }} className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-sm active:scale-95" title="Remove"><FiTrash2 className="w-3.5 h-3.5" /></button>
        </div>
    );

    const header = (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4">
            <h5 className="m-0 text-xl font-bold text-gray-900 tracking-tight">Product Catalog</h5>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={() => setGlobalFilter('')} className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 text-xs" />
                <span className="relative">
                    <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Keyword Search" className="pl-10 pr-4 py-2 bg-white border border-gray-300 shadow-sm focus:border-color1 outline-none text-gray-900 font-medium rounded-md w-full text-xs" />
                </span>
                <Button label="New Product" icon="pi pi-plus" className="bg-color1 border-none py-2 px-6 rounded-md shadow-sm font-bold text-white flex items-center justify-center gap-2 text-xs" onClick={() => navigate('/admin/products/add')} />
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    value={products}
                    paginator
                    rows={15}
                    loading={loading}
                    globalFilter={globalFilter}
                    header={header}
                    showGridlines
                    responsiveLayout="stack"
                    breakpoint="960px"
                    className="products-table"
                    emptyMessage={
                        <div className="py-20 text-center">
                            <i className="pi pi-box text-6xl text-gray-200 mb-4" />
                            <p className="text-gray-500 font-bold text-sm mt-3">No Products Found. Build your catalog!</p>
                        </div>
                    }
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    paginatorClassName="border-t border-gray-50 py-4"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                >
                    <Column header="Sl" body={slTemplate} className="w-16 text-center" />
                    <Column header="Product & Variations" body={productTemplate} sortable field="name" />
                    <Column header="Category & Brand" body={categoryTemplate} sortable field="brandId.name" />
                    <Column header="Variants" body={variantsTemplate} headerClassName="justify-center" className="text-center" />
                    <Column header="Status" body={statusTemplate} headerClassName="justify-center" className="text-center" sortable field="active" />
                    <Column header="Actions" body={actionTemplate} headerClassName="justify-center" className="text-center w-36" />
                </DataTable>
            </div>

            {/* Edit Modal (Aligned with AddProduct Clean Style) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditModal} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col">
                        <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Edit Product</h3>
                            <button onClick={closeEditModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><FiX /></button>
                        </div>

                        <form onSubmit={handleUpdate} className="overflow-y-auto p-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <label className={labelStyle}>Product Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Status</label>
                                    <select value={formData.active} onChange={(e) => setFormData({ ...formData, active: Number(e.target.value) })} className={inputStyle}>
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Image Strategy</label>
                                    <select
                                        value={formData.setImg}
                                        onChange={(e) => setFormData({ ...formData, setImg: e.target.value })}
                                        className={inputStyle}
                                    >
                                        <option value="combine">Combine (Global Gallery)</option>
                                        <option value="split">Split (Variant-wise Images)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Category</label>
                                    <Select options={categories} value={formData.categoryTypeId} onChange={(val) => setFormData({ ...formData, categoryTypeId: val })} className="text-sm" />
                                </div>
                                <div>
                                    <label className={labelStyle}>Brand</label>
                                    <Select options={brands} value={formData.brandId} onChange={(val) => setFormData({ ...formData, brandId: val })} className="text-sm" />
                                </div>
                                <div>
                                    <label className={labelStyle}>Exp. Time</label>
                                    <input type="text" value={formData.expectedTime} onChange={(e) => setFormData({ ...formData, expectedTime: e.target.value })} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Return Policy</label>
                                    <select
                                        value={formData.returnPolicy}
                                        onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                                        className={inputStyle}
                                    >
                                        <option value="no return">No Return</option>
                                        <option value="7 days return">7 Days Return</option>
                                        <option value="7 day replacement">7 Day Replacement</option>
                                    </select>
                                </div>

                                <div className="lg:col-span-3">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        Dynamic Charges List
                                        <button type="button" onClick={addChargeRow} className="ml-auto text-color1 hover:text-color2 text-[10px] font-black underline decoration-2 underline-offset-4">+ Add Charge</button>
                                    </h3>
                                    <div className="space-y-4">
                                        {formData.charges.map((charge, idx) => (
                                            <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-gray-50/50 border border-gray-100 rounded-xl transition-all hover:bg-gray-100/80 group">
                                                <div className="flex-1 min-w-[150px]">
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1.5 ml-1">Charge Name</label>
                                                    <select
                                                        value={charge.name}
                                                        onChange={(e) => handleChargeChange(idx, 'name', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-color1 outline-none shadow-sm cursor-pointer"
                                                    >
                                                        <option value="">Select Charge...</option>
                                                        {chargeOptions
                                                            .filter(opt => opt === charge.name || !formData.charges.some(c => c.name === opt))
                                                            .map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1.5 text-center">Amount</label>
                                                    <input
                                                        type="number"
                                                        value={charge.amount}
                                                        onChange={(e) => handleChargeChange(idx, 'amount', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 focus:border-color1 outline-none shadow-sm text-center"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1.5 text-center">Type</label>
                                                    <select
                                                        value={charge.type}
                                                        onChange={(e) => handleChargeChange(idx, 'type', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:border-color1 outline-none cursor-pointer shadow-sm"
                                                    >
                                                        <option value="fixed">Fixed (₹)</option>
                                                        <option value="percentage">Percent (%)</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-end pt-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChargeRow(idx)}
                                                        className="p-2 text-gray-300 hover:text-red-500 bg-white border border-gray-200 rounded-lg transition-colors shadow-sm active:scale-95"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-3">
                                    <label className={labelStyle}>Search Keywords (Comma Sep.)</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputStyle} placeholder="tag1, tag2..." />
                                </div>

                                <div className="lg:col-span-3">
                                    <label className={labelStyle}>Description</label>
                                    <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputStyle} h-24 resize-none`} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Variations</h4>
                                    <button type="button" onClick={addTypeRow} className="text-color1 text-[10px] font-black uppercase hover:underline">+ New Variant</button>
                                </div>
                                <div className="space-y-8 mt-4">
                                    {formData.types.map((type, index) => (
                                        <div key={index} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 space-y-6 relative transition-all hover:border-green-200 group">
                                            {/* Variant Header */}
                                            <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-color8 text-color3 text-[10px] font-black underline decoration-2 underline-offset-2">#{index + 1}</span>
                                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Variation Instance</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTypeRow(index)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Remove Variation"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                <div>
                                                    <label className={labelStyle}>Qty</label>
                                                    <input type="number" step="any" value={type.qty} onChange={(e) => handleTypeChange(index, 'qty', e.target.value)} className={inputStyle} placeholder="Qty" />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>Unit</label>
                                                    <select value={type.unitId} onChange={(e) => handleTypeChange(index, 'unitId', e.target.value)} className={inputStyle}>
                                                        <option value="">Unit...</option>
                                                        {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>Price (₹)</label>
                                                    <input type="number" step="any" value={type.price} onChange={(e) => handleTypeChange(index, 'price', e.target.value)} className={`${inputStyle} border-green-200 text-green-700 font-bold`} placeholder="Price" />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>MRP (₹)</label>
                                                    <input type="number" step="any" value={type.mrp} onChange={(e) => handleTypeChange(index, 'mrp', e.target.value)} className={inputStyle} placeholder="MRP" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-4">
                                                    <label className={labelStyle}>Short Description</label>
                                                    <input type="text" value={type.description} onChange={(e) => handleTypeChange(index, 'description', e.target.value)} className={inputStyle} placeholder="One line description..." />

                                                    {formData.setImg === 'split' && (
                                                        <div className="mt-2">
                                                            <label className={labelStyle}>Variant Images</label>
                                                            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white border border-gray-200 rounded-xl min-h-[60px]">
                                                                {variantImagePreviews[index]?.map((preview, i) => (
                                                                    <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden group">
                                                                        <img src={preview} className="w-full h-full object-cover" alt="" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeVariantImage(index, i)}
                                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <FiX className="text-white w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <label className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-color1 hover:bg-emerald-50 transition-all text-gray-400 hover:text-color1">
                                                                    <FiPlus />
                                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleVariantImagesChange(index, e)} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-end gap-3 pb-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTypeChange(index, 'veg', !type.veg)}
                                                        className={`flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${type.veg ? 'bg-color7 text-color1 border-color1/20' : 'bg-red-50 text-red-500 border-red-200'}`}
                                                    >
                                                        {type.veg ? 'Veg' : 'Non-Veg'}
                                                    </button>
                                                    <div className="w-24">
                                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 tracking-widest text-center">Max Lmt</label>
                                                        <input type="number" value={type.maxOrder} onChange={(e) => handleTypeChange(index, 'maxOrder', e.target.value)} className="w-full h-10 px-2 bg-white border border-gray-200 rounded-lg text-center text-xs font-bold focus:border-color1 outline-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Detailed Information (Rich Text)</label>
                                                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden variation-rich-editor shadow-sm">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={type.info || ''}
                                                        onChange={(content) => handleTypeChange(index, 'info', content)}
                                                        className="min-h-[150px]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className={labelStyle}>Change Thumbnail</label>
                                    <div className="relative aspect-video rounded-lg border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group bg-gray-50">
                                        {thumbnailPreview ? <img src={thumbnailPreview} className="w-full h-full object-contain p-2" /> : <FiImage className="text-gray-200 w-10 h-10" />}
                                        <input type="file" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-white text-[10px] font-black uppercase px-3 py-1 bg-black/50 rounded-full">Replace Image</span>
                                        </div>
                                    </div>
                                </div>
                                {formData.setImg === 'combine' && (
                                    <div>
                                        <label className={labelStyle}>Gallery Assets</label>
                                        <div className="flex flex-wrap gap-3 mb-4">
                                            {imagePreviews.map((preview, i) => (
                                                <div key={i} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden group">
                                                    <img src={preview} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newFormData = { ...formData };
                                                            newFormData.images.splice(i, 1);
                                                            setFormData(newFormData);
                                                            const newPreviews = [...imagePreviews];
                                                            newPreviews.splice(i, 1);
                                                            setImagePreviews(newPreviews);
                                                        }}
                                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <FiX className="text-white w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="relative aspect-video rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <FiPlus className="text-gray-300 w-8 h-8 mb-2 group-hover:text-green-500 transition-colors" />
                                            <span className="text-[10px] font-black uppercase text-gray-400">Add Gallery Images</span>
                                            <input type="file" multiple onChange={handleImagesChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            {imageFiles.length > 0 && <span className="mt-2 text-green-600 font-bold text-[10px]">{imageFiles.length} new selected</span>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t font-semibold">
                                <button type="button" onClick={closeEditModal} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-color1 hover:bg-color2 text-white rounded-lg text-sm shadow-md transition-all flex items-center gap-2">
                                    {isSubmitting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {isDetailsModalOpen && viewingProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetailsModal} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col p-8 md:p-12 animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white p-1">
                                    {viewingProduct.thumbnail?.path?.medium ? (
                                        <img src={`${import.meta.env.VITE_SERVER_URL}${viewingProduct.thumbnail.path.medium}`} className="w-full h-full object-contain" />
                                    ) : <FiImage className="w-full h-full p-4 text-gray-200" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{viewingProduct.name}</h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{viewingProduct.brandId?.name}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest">{viewingProduct.categoryTypeId?.name}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeDetailsModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><FiX className="w-5 h-5" /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-1 space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Description</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{viewingProduct.description || 'No detailed description available for this item.'}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Time</span>
                                        <span className="text-sm font-bold text-gray-700">{viewingProduct.expectedTime || 'Standard'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Return Policy</span>
                                        <span className="text-sm font-bold text-gray-700 capitalize">{viewingProduct.returnPolicy || 'no return'}</span>
                                    </div>
                                    {viewingProduct.charges?.map((charge, idx) => (
                                        <div key={idx} className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{charge.name}</span>
                                            <span className="text-sm font-bold text-gray-700">
                                                {charge.type === 'percentage' ? `${charge.amount}%` : `₹${charge.amount}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">Inventory Matrix</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {viewingProduct.types?.map((type, i) => (
                                        <div key={i} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 transition-all hover:border-green-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${type.veg ? 'bg-green-500' : 'bg-red-500'} shadow-sm shadow-current/20`}></div>
                                                    <span className="text-sm font-bold text-gray-800">{type.qty} {type.unitId?.code || type.unitId?.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-green-600">₹{type.price}</span>
                                                    {type.mrp > type.price && (
                                                        <span className="block text-[10px] text-gray-300 line-through">₹{type.mrp}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {type.description && (
                                                <p className="text-[10px] text-gray-500 font-medium italic border-l-2 border-green-200 pl-2">{type.description}</p>
                                            )}
                                            {type.info && (
                                                <div className="text-[11px] text-gray-600 ql-editor-view mt-2" dangerouslySetInnerHTML={{ __html: type.info }} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {viewingProduct.images?.length > 0 && (
                                    <div className="mt-10">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-5 tracking-widest">Visual Assets</h4>
                                        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2 custom-scrollbar">
                                            {viewingProduct.images.map((img, i) => (
                                                <div key={i} className="relative group h-28 w-28 flex-shrink-0">
                                                    <img
                                                        src={`${import.meta.env.VITE_SERVER_URL}${img.path?.medium || img.path?.original}`}
                                                        className="h-full w-full rounded-xl object-contain border border-gray-100 bg-white p-1"
                                                    />
                                                    <button
                                                        onClick={() => handleDeleteGalleryImage(viewingProduct._id, img._id)}
                                                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all border-2 border-white hover:bg-red-700 active:scale-95 z-20"
                                                        title="Delete Image"
                                                    >
                                                        <FiX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation (Clean Standard) */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 p-8 text-center animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full mb-4 flex items-center justify-center mx-auto"><FiTrash2 className="w-6 h-6" /></div>
                        <h3 className="text-lg font-bold text-gray-900">Remove Product?</h3>
                        <p className="text-sm text-gray-500 mt-2">You are about to delete <span className="font-bold text-gray-800">"{deletingProduct?.name}"</span>. This action cannot be reversed.</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-all shadow-md active:scale-95">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .variation-rich-editor .ql-container {
                    border: none !important;
                    min-height: 100px;
                }
                .variation-rich-editor .ql-editor {
                    font-size: 14px;
                    padding: 12px;
                }
                .variation-rich-editor .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    background: #f9fafb;
                }
                .ql-editor-view {
                    padding: 0 !important;
                }
                .ql-editor-view p {
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default Products;
