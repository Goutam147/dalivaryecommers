import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiImage, FiEye } from 'react-icons/fi';
import Select from 'react-select';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Relational Data for Dropdowns
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Initial Form State matching backend Schema
    const initialFormState = {
        name: '',
        description: '',
        title: '', // comma separated strings
        unit: 'pcs',
        categoryId: null,
        brand: null,
        expectedTime: '',
        returnPolicy: '',
        active: 1,
        types: [{ qty: 1, price: 0, mrp: 0, description: '', maxOrder: 1, verified: false }],
        charges: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // Single array holding global gallery files
    const [imageFiles, setImageFiles] = useState([]);

    // Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, brandRes] = await Promise.all([
                api.get('/product'),
                api.get('/category-type'),
                api.get('/brand')
            ]);

            if (prodRes.data.success) setProducts(prodRes.data.data);
            if (catRes.data.success) {
                // map to react-select options
                setCategories(catRes.data.data.map(c => ({ value: c._id, label: c.name })));
            }
            if (brandRes.data.success) {
                // map to react-select options
                setBrands(brandRes.data.data.map(b => ({ value: b._id, label: b.name })));
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

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            // Translate array of strings back to comma separated for textarea/input if needed
            setFormData({
                name: product.name || '',
                description: product.description || '',
                title: product.title ? product.title.join(', ') : '',
                unit: product.unit || 'pcs',
                categoryId: product.categoryId ? { value: product.categoryId._id || product.categoryId, label: product.categoryId.name || 'Selected' } : null,
                brand: product.brand ? { value: product.brand._id || product.brand, label: product.brand.name || 'Selected' } : null,
                expectedTime: product.expectedTime || '',
                returnPolicy: product.returnPolicy || '',
                active: product.active ?? 1,
                types: product.types && product.types.length > 0 ? product.types : initialFormState.types,
                charges: product.charges || []
            });
            setThumbnailPreview(product.thumbnail?.path?.medium ? `${import.meta.env.VITE_SERVER_URL}${product.thumbnail.path.medium}` : null);
        } else {
            setEditingProduct(null);
            setFormData(initialFormState);
            setThumbnailPreview(null);
        }
        setThumbnailFile(null);
        setImageFiles([]);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingProduct(null);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setImageFiles([]);
    };

    const openDetailsModal = (product) => {
        setViewingProduct(product);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setViewingProduct(null);
    };

    // --- Dynamic Nested Handlers ---
    const handleTypeChange = (index, field, value) => {
        const newTypes = [...formData.types];
        newTypes[index][field] = value;
        setFormData({ ...formData, types: newTypes });
    };

    const addTypeRow = () => {
        setFormData({
            ...formData,
            types: [...formData.types, { qty: 1, price: 0, mrp: 0, description: '', maxOrder: 1, verified: false }]
        });
    };

    const removeTypeRow = (index) => {
        if (formData.types.length <= 1) return toast.warning("Product must have at least one variation type.");
        const newTypes = formData.types.filter((_, i) => i !== index);
        setFormData({ ...formData, types: newTypes });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.warning('Product name is required');
        if (!formData.unit.trim()) return toast.warning('Unit is required');

        try {
            setIsSubmitting(true);

            const payloadObject = {
                ...formData,
                categoryId: formData.categoryId ? formData.categoryId.value : null,
                brand: formData.brand ? formData.brand.value : null,
                title: formData.title.split(',').map(t => t.trim()).filter(t => t), // clean comma separated string to array
                types: formData.types.map(t => ({
                    ...t,
                    qty: Number(t.qty),
                    price: Number(t.price),
                    mrp: Number(t.mrp),
                    maxOrder: Number(t.maxOrder)
                }))
            };

            const payloadData = new FormData();

            // The backend Validator specifically parses a single `data` field to navigate deep object structures
            payloadData.append('data', JSON.stringify(payloadObject));

            if (thumbnailFile) {
                payloadData.append('thumbnail', thumbnailFile);
            }

            if (imageFiles && imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    payloadData.append('images', file);
                });
            }

            if (editingProduct) {
                await api.put(`/product/${editingProduct._id}`, payloadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated dramatically!');
            } else {
                await api.post('/product', payloadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product created powerfully!');
            }
            fetchData();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed!');
            console.error(error.response?.data?.errors);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b border-gray-100 bg-white/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Products</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure advanced product catalogs, sizes, and pricing variations.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            <div className="flex-1 p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-gray-500 text-lg font-medium">No Products Found. Launch your first offering!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4 text-center">Variations</th>
                                    <th className="px-6 py-4 text-center">Base Unit</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-green-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-4">
                                            {product.thumbnail?.path?.thumbnail ? (
                                                <img src={`${import.meta.env.VITE_SERVER_URL}${product.thumbnail.path.thumbnail}`} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-white" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-lg">
                                                    <FiImage />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span>{product.name}</span>
                                                <span className="text-xs text-gray-400 font-normal truncate max-w-[200px]">{product.description || 'No description'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-50 text-blue-600 py-1 px-3 rounded-full text-xs font-bold border border-blue-100">
                                                {product.types?.length || 0} configurations
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-center text-sm font-semibold uppercase">
                                            {product.unit}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {product.active === 1 ? (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openDetailsModal(product)}
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-block mr-2"
                                                title="View Details"
                                            >
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openModal(product)}
                                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors inline-block"
                                                title="Edit Product"
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

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 flex justify-between items-center p-6 border-b border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingProduct ? 'Edit Complex Product' : 'Construct New Product'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">

                            {/* Core Identity System */}
                            <section>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                                    Core Identity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder-gray-400" placeholder="e.g. Organic Almonds" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Descriptor <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder-gray-400" placeholder="e.g. kg, pcs, ltr" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category Assignment</label>
                                        <Select
                                            options={categories}
                                            value={formData.categoryId}
                                            onChange={(selectedOption) => setFormData({ ...formData, categoryId: selectedOption })}
                                            placeholder="Select Category..."
                                            className="w-full text-sm"
                                            styles={{
                                                control: (baseStyles) => ({
                                                    ...baseStyles,
                                                    borderRadius: '0.75rem',
                                                    padding: '0.35rem',
                                                    borderColor: '#e5e7eb',
                                                    boxShadow: 'none',
                                                    '&:hover': { borderColor: '#22c55e' }
                                                }),
                                                menu: (base) => ({ ...base, zIndex: 100 })
                                            }}
                                            isClearable
                                            isSearchable={true}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Origin</label>
                                        <Select
                                            options={brands}
                                            value={formData.brand}
                                            onChange={(selectedOption) => setFormData({ ...formData, brand: selectedOption })}
                                            placeholder="Search Brand..."
                                            className="w-full text-sm"
                                            styles={{
                                                control: (baseStyles) => ({
                                                    ...baseStyles,
                                                    borderRadius: '0.75rem',
                                                    padding: '0.35rem',
                                                    borderColor: '#e5e7eb',
                                                    boxShadow: 'none',
                                                    '&:hover': { borderColor: '#22c55e' }
                                                }),
                                                menu: (base) => ({ ...base, zIndex: 100 })
                                            }}
                                            isClearable
                                            isSearchable={true}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Titles (Comma Separated)</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder-gray-400" placeholder="e.g. healthy, nuts, organic dry fruits" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rich Description</label>
                                        <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder-gray-400 resize-none" placeholder="Provide a compelling product description..."></textarea>
                                    </div>
                                </div>
                            </section>


                            {/* Pricing & Variations Array Engine */}
                            <section>
                                <div className="flex justify-between items-end mb-4">
                                    <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                                        Variations & Pricing Engine <span className="text-red-500 text-sm">*</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={addTypeRow}
                                        className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors border border-blue-200"
                                    >
                                        <FiPlus className="w-4 h-4" /> Add Variation Size
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.types.map((type, index) => (
                                        <div key={index} className="bg-white border-2 border-green-50 p-5 rounded-2xl relative shadow-sm group hover:border-green-200 transition-colors">
                                            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-white">
                                                V{index + 1}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeTypeRow(index)}
                                                className="absolute top-4 right-4 text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-colors object-contain"
                                                title="Remove Variation"
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 pr-12">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quantity/Weight</label>
                                                    <input type="number" step="any" min="0" required value={type.qty} onChange={(e) => handleTypeChange(index, 'qty', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sale Price (₹)</label>
                                                    <input type="number" step="any" min="0" required value={type.price} onChange={(e) => handleTypeChange(index, 'price', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-green-200 text-green-700 bg-green-50/50 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-bold placeholder-green-300" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">MRP / Retail (₹)</label>
                                                    <input type="number" step="any" min="0" required value={type.mrp} onChange={(e) => handleTypeChange(index, 'mrp', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-semibold text-gray-500 line-through" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max Order Lmt</label>
                                                    <input type="number" step="1" min="1" required value={type.maxOrder} onChange={(e) => handleTypeChange(index, 'maxOrder', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-semibold" />
                                                </div>
                                                <div className="md:col-span-4 mt-2">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Variation Description (Optional)</label>
                                                    <input type="text" value={type.description} onChange={(e) => handleTypeChange(index, 'description', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm" placeholder="e.g. Specifically packaged in glass jars for zero plastic waste." />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Digital Media */}
                            <section>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                                    Digital Assets
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    {/* Thumbnail Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Primary Thumbnail</label>
                                        <div className="flex items-center gap-5">
                                            {thumbnailPreview ? (
                                                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 shrink-0 shadow-sm bg-white p-1">
                                                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setThumbnailPreview(null);
                                                            setThumbnailFile(null);
                                                        }}
                                                        className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <FiX className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shrink-0 text-gray-400">
                                                    <FiImage className="w-8 h-8 mb-1" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider">Cover</span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition-colors cursor-pointer"
                                                />
                                                <p className="text-xs text-gray-500 mt-2 font-medium">Auto-converted to 3-Size WebP</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gallery Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Linked Media Gallery (Max 10)</label>
                                        <div className="w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImagesChange}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-colors cursor-pointer"
                                            />
                                            {imageFiles.length > 0 && (
                                                <p className="text-sm font-bold text-blue-600 mt-3 flex items-center gap-2">
                                                    <FiCheck /> {imageFiles.length} files firmly staged for global upload
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 -mx-6 md:-mx-8 !mt-12 flex gap-3 justify-end rounded-b-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md shadow-green-600/20 disabled:opacity-70 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                                >
                                    {isSubmitting && <div className="w-5 h-5 border-2 border-green-200 border-t-white rounded-full animate-spin"></div>}
                                    {editingProduct ? 'Update Master Record' : 'Publish Product Setup'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {isDetailsModalOpen && viewingProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetailsModal} />

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 flex justify-between items-center p-6 border-b border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                    <FiEye className="w-5 h-5" />
                                </span>
                                Product Details Overview
                            </h3>
                            <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {/* Top Info Header */}
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {viewingProduct.thumbnail?.path?.medium ? (
                                    <img src={`${import.meta.env.VITE_SERVER_URL}${viewingProduct.thumbnail.path.medium}`} alt={viewingProduct.name} className="w-32 h-32 rounded-2xl object-cover border border-gray-200 shadow-sm shrink-0" />
                                ) : (
                                    <div className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 shrink-0">
                                        <FiImage className="w-8 h-8 mb-2" />
                                        <span className="text-xs font-bold uppercase">No Thumb</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">{viewingProduct.name}</h2>
                                    <p className="text-gray-600 mb-3">{viewingProduct.description || 'No description provided.'}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {viewingProduct.title?.map((tag, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">#{tag}</span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Base Unit</p>
                                            <p className="font-semibold text-gray-800">{viewingProduct.unit || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Status</p>
                                            <p className="font-semibold text-green-600">{viewingProduct.active ? 'Active' : 'Inactive'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Expected Time</p>
                                            <p className="font-semibold text-gray-800">{viewingProduct.expectedTime || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variations Grid View */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    Variations & Attributes ({viewingProduct.types?.length || 0})
                                </h4>
                                <div className="space-y-4">
                                    {viewingProduct.types?.map((type, idx) => (
                                        <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                <span className="font-bold text-gray-700 flex items-center gap-2">
                                                    <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded text-xs">V{idx + 1}</span>
                                                    {type.qty} {viewingProduct.unit}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400">Max Order: {type.maxOrder}</span>
                                            </div>
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Price</p>
                                                    <p className="text-lg font-bold text-green-600">₹{type.price}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">MRP</p>
                                                    <p className="text-lg font-bold text-gray-500 line-through">₹{type.mrp}</p>
                                                </div>
                                                <div className="md:col-span-3">
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Details</p>
                                                    <p className="text-sm text-gray-700">{type.description || 'No variant details'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
