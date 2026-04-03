import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiX, FiPlus, FiTrash2, FiImage, FiArrowLeft, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AddProduct = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Relational Data for Dropdowns
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [units, setUnits] = useState([]);

    // Common Charge Names for Dropdown
    const chargeOptions = [
        "Delivery Charge",
        "Packing Charge",
        "GST",
    ];

    // Initial Form State
    const initialFormState = {
        name: '',
        description: '',
        title: '', // comma separated strings
        categoryTypeId: null,
        brandId: null,
        expectedTime: '',
        returnPolicy: 'no return',
        active: 1,
        setImg: 'combine',
        types: [{ qty: '', unitId: '', price: '', mrp: '', description: '', maxOrder: 1, verified: false, veg: false, info: '', images: [] }],
        charges: []
    };

    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormState)));
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Variant-specific images (for 'split' mode)
    const [variantImageFiles, setVariantImageFiles] = useState([[]]);
    const [variantImagePreviews, setVariantImagePreviews] = useState([[]]);

    const fetchData = async () => {
        try {
            const [catRes, brandRes, unitRes] = await Promise.all([
                api.get('/category-type'),
                api.get('/brand'),
                api.get('/unit')
            ]);

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
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTypeChange = (index, field, value) => {
        const newTypes = [...formData.types];
        newTypes[index][field] = value;
        setFormData({ ...formData, types: newTypes });
    };

    const addTypeRow = () => {
        setFormData({
            ...formData,
            types: [...formData.types, { qty: '', unitId: '', price: '', mrp: '', description: '', maxOrder: 1, verified: false, veg: false, info: '', images: [] }]
        });
        setVariantImageFiles([...variantImageFiles, []]);
        setVariantImagePreviews([...variantImagePreviews, []]);
    };

    const removeTypeRow = (index) => {
        if (formData.types.length <= 1) return;
        const newTypes = formData.types.filter((_, i) => i !== index);
        setFormData({ ...formData, types: newTypes });
        setVariantImageFiles(variantImageFiles.filter((_, i) => i !== index));
        setVariantImagePreviews(variantImagePreviews.filter((_, i) => i !== index));
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
        setImageFiles(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeGalleryImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
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
        const newFiles = [...variantImageFiles];
        newFiles[variantIndex] = newFiles[variantIndex].filter((_, i) => i !== imageIndex);
        setVariantImageFiles(newFiles);

        const newPreviews = [...variantImagePreviews];
        newPreviews[variantIndex] = newPreviews[variantIndex].filter((_, i) => i !== imageIndex);
        setVariantImagePreviews(newPreviews);
    };

    const handleChargeChange = (index, field, value) => {
        const newCharges = [...formData.charges];
        newCharges[index][field] = value;
        setFormData({ ...formData, charges: newCharges });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.warning('Product name is required');

        const invalidType = formData.types.find(t => !t.unitId || t.price === '' || t.qty === '');
        if (invalidType) return toast.warning('Please complete all variation details.');

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
                    mrp: t.mrp !== '' ? Number(t.mrp) : 0,
                    maxOrder: Number(t.maxOrder)
                }))
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

            await api.post('/product', payloadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Product created successfully!');

            setFormData(JSON.parse(JSON.stringify(initialFormState)));
            setThumbnailFile(null);
            setThumbnailPreview(null);
            setImageFiles([]);
            setImagePreviews([]);
            setVariantImageFiles([[]]);
            setVariantImagePreviews([[]]);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle = "block text-xs font-bold text-black uppercase tracking-wider mb-2";
    const inputStyle = "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm text-black placeholder:text-black";

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="p-2 text-black hover:text-black hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-black tracking-tight">Product Register</h1>
                        <p className="text-sm text-black opacity-80">Add detailed information and variants to your inventory.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        form="product-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md disabled:opacity-50 transition-all transform active:scale-95"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : <FiSave className="w-4 h-4" />}
                        Commit Record
                    </button>
                </div>
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200">
                        <h2 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                            General Attributes
                        </h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                        <div className="lg:col-span-2">
                            <label className={labelStyle}>Product Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputStyle}
                                placeholder="Formal Product Title"
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Status</label>
                            <select
                                value={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: Number(e.target.value) })}
                                className={inputStyle}
                            >
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
                            <label className={labelStyle}>Category Connection</label>
                            <Select
                                options={categories}
                                value={formData.categoryTypeId}
                                onChange={(val) => setFormData({ ...formData, categoryTypeId: val })}
                                placeholder="Search Categories..."
                                className="text-sm"
                                isClearable
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Manufacturer/Brand</label>
                            <Select
                                options={brands}
                                value={formData.brandId}
                                onChange={(val) => setFormData({ ...formData, brandId: val })}
                                placeholder="Search Brands..."
                                className="text-sm"
                                isClearable
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Estimated Fulfillment</label>
                            <input
                                type="text"
                                value={formData.expectedTime}
                                onChange={(e) => setFormData({ ...formData, expectedTime: e.target.value })}
                                className={inputStyle}
                                placeholder="e.g. 24-48 Hours"
                            />
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

                        <div className="lg:col-span-2">
                            <label className={labelStyle}>Search Keywords (Tags)</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={inputStyle}
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </div>

                        <div className="lg:col-span-3">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xs font-black text-black uppercase tracking-[0.2em]">
                                    Dynamic Charges Interface
                                </h3>
                                <button
                                    type="button"
                                    onClick={addChargeRow}
                                    className="px-4 py-2 bg-color1 hover:bg-color2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <FiPlus className="w-3 h-3" /> New Charge Entry
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.charges.map((charge, idx) => (
                                    <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-gray-50/50 border border-gray-100 rounded-xl transition-all hover:bg-gray-100/80 group">
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-[8px] font-black text-black uppercase mb-1.5 ml-1">Charge Name</label>
                                            <select
                                                value={charge.name}
                                                onChange={(e) => handleChargeChange(idx, 'name', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-green-500 outline-none shadow-sm cursor-pointer"
                                            >
                                                <option value="">Select Charge...</option>
                                                {chargeOptions
                                                    .filter(opt => opt === charge.name || !formData.charges.some(c => c.name === opt))
                                                    .map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-[8px] font-black text-black uppercase mb-1.5 text-center">Amount</label>
                                            <input
                                                type="number"
                                                value={charge.amount}
                                                onChange={(e) => handleChargeChange(idx, 'amount', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-black focus:border-green-500 outline-none shadow-sm text-center"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-[8px] font-black text-black uppercase mb-1.5 text-center">Type</label>
                                            <select
                                                value={charge.type}
                                                onChange={(e) => handleChargeChange(idx, 'type', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:border-green-500 outline-none cursor-pointer shadow-sm"
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
                                {formData.charges.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No charges configured for this catalog entry</p>
                                        <button type="button" onClick={addChargeRow} className="mt-3 text-[10px] font-bold text-green-500 hover:underline">Add First Charge</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <label className={labelStyle}>Description Details</label>
                            <textarea
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={`${inputStyle} h-32 resize-none py-3`}
                                placeholder="Provide a comprehensive technical and marketing description..."
                            />
                        </div>
                    </div>
                </div>

                {/* Variations Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xs font-black text-black uppercase tracking-widest">Inventory Matrix</h2>
                        <button
                            type="button"
                            onClick={addTypeRow}
                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <FiPlus className="w-3 h-3" /> New Variant
                        </button>
                    </div>
                    <div className="p-6 space-y-8">
                        {formData.types.map((type, index) => (
                            <div key={index} className="bg-gray-50/50 rounded-2xl border border-gray-200 p-6 space-y-6 relative group transition-all hover:border-green-200">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-[10px] font-black underline decoration-2 underline-offset-2">#{index + 1}</span>
                                        <h4 className="text-[10px] font-black uppercase text-black tracking-[0.2em]">Product Variation Instance</h4>
                                    </div>
                                    {formData.types.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTypeRow(index)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remove Variation"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    <div>
                                        <label className={labelStyle}>Quantity</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={type.qty}
                                            onChange={(e) => handleTypeChange(index, 'qty', e.target.value)}
                                            className={inputStyle}
                                            placeholder="e.g. 500"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Unit</label>
                                        <select
                                            value={type.unitId}
                                            onChange={(e) => handleTypeChange(index, 'unitId', e.target.value)}
                                            className={inputStyle}
                                        >
                                            <option value="">Choose Unit...</option>
                                            {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Sale Price (₹)</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={type.price}
                                            onChange={(e) => handleTypeChange(index, 'price', e.target.value)}
                                            className={`${inputStyle} border-green-200 bg-green-50/30 font-bold text-green-700`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>MRP (₹)</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={type.mrp}
                                            onChange={(e) => handleTypeChange(index, 'mrp', e.target.value)}
                                            className={inputStyle}
                                            placeholder="Retail Price"
                                        />
                                    </div>
                                    <div className="flex items-end gap-3 pb-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange(index, 'veg', !type.veg)}
                                            className={`flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${type.veg
                                                ? 'bg-green-50 text-green-600 border-green-200'
                                                : 'bg-red-50 text-red-500 border-red-200'
                                                }`}
                                        >
                                            {type.veg ? 'Veg' : 'Non-Veg'}
                                        </button>
                                        <div className="w-24">
                                            <label className="block text-[8px] font-black text-black uppercase tracking-widest mb-1">Max Lmt</label>
                                            <input
                                                type="number"
                                                value={type.maxOrder}
                                                onChange={(e) => handleTypeChange(index, 'maxOrder', e.target.value)}
                                                className="w-full h-10 px-2 bg-white border border-gray-200 rounded-lg text-center text-xs font-bold focus:border-green-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-4">
                                        <label className={labelStyle}>Variant Short Description</label>
                                        <input
                                            type="text"
                                            value={type.description}
                                            onChange={(e) => handleTypeChange(index, 'description', e.target.value)}
                                            className={inputStyle}
                                            placeholder="Briefly describe this specific size/variant..."
                                        />

                                        {formData.setImg === 'split' && (
                                            <div className="mt-2">
                                                <label className={labelStyle}>Variant Gallery</label>
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
                                    <div className="variation-rich-editor">
                                        <label className={labelStyle}>Detailed Information (Rich Text)</label>
                                        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                                            <ReactQuill
                                                theme="snow"
                                                value={type.info || ''}
                                                onChange={(content) => handleTypeChange(index, 'info', content)}
                                                className="min-h-[150px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Media Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all overflow-hidden flex flex-col">
                        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200">
                            <h2 className="text-xs font-black text-black uppercase tracking-widest">Master Thumbnail</h2>
                        </div>
                        <div className="p-8 flex-1 flex flex-col gap-6">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center p-4">
                                {thumbnailPreview ? (
                                    <>
                                        <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); }}
                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-red-500 rounded-lg p-2 shadow-md hover:bg-red-50 transition-colors border border-gray-100"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center flex flex-col items-center gap-3">
                                        <FiImage className="w-12 h-12 text-gray-200" />
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Asset Loaded</p>
                                    </div>
                                )}
                            </div>
                            <label className="cursor-pointer">
                                <span className="block w-full text-center px-4 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-all text-[10px] uppercase tracking-widest shadow-lg active:scale-[0.98]">
                                    Upload Feature Image
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleThumbnailChange}
                                />
                            </label>
                        </div>
                    </div>

                    {formData.setImg === 'combine' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all overflow-hidden flex flex-col">
                            <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200">
                                <h2 className="text-xs font-black text-black uppercase tracking-widest">Asset Gallery</h2>
                            </div>
                            <div className="p-8 flex-1 flex flex-col gap-6">
                                {/* Gallery Preview Grid */}
                                <div className="flex-1 grid grid-cols-4 gap-4 max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group bg-gray-50">
                                            <img src={preview} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(i)}
                                                className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 shadow-sm"
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {imageFiles.length === 0 && (
                                        <div className="col-span-4 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-100 rounded-xl">
                                            <FiPlus className="w-6 h-6 text-gray-200 mb-2" />
                                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">No Gallery Assets</p>
                                        </div>
                                    )}
                                </div>

                                <label className="cursor-pointer group">
                                    <span className="block w-full text-center px-4 py-3 bg-white border-2 border-dashed border-gray-300 group-hover:border-green-500 group-hover:text-green-600 text-black font-bold rounded-lg transition-all text-[10px] uppercase tracking-widest">
                                        Append Supplementary Images
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImagesChange}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pb-12 pt-4 flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-10 py-3 text-xs font-bold text-black hover:text-black transition-colors uppercase tracking-widest"
                    >
                        Return to Dashboard
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-14 py-3 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-green-600/20 flex items-center gap-3 transition-all transform active:scale-95"
                    >
                        {isSubmitting ? 'Processing Submission...' : 'Execute Product Registration'}
                    </button>
                </div>
            </form>

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
            `}</style>
        </div>
    );
};

export default AddProduct;
