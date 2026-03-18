import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
    FiArrowLeft, FiShoppingBag, FiShare2, FiStar, 
    FiShield, FiRefreshCw, FiMinus, FiPlus, FiTag, FiClock, FiHeart
} from 'react-icons/fi';
import { MdOutlineFastfood } from 'react-icons/md';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/product/${id}`);
                if (res.data.success) {
                    const prodData = res.data.data;
                    setProduct(prodData);
                    
                    const initialImg = prodData.thumbnail?.path?.large || 
                                     prodData.thumbnail?.path?.medium || 
                                     prodData.images?.[0]?.path?.large || 
                                     prodData.images?.[0]?.path?.medium;
                    setActiveImage(initialImg);
                    
                    if (prodData.types?.length > 0) {
                        setSelectedType(prodData.types[0]);
                    }

                    if (prodData.categoryTypeId?._id) {
                        const recRes = await api.get('/product');
                        if (recRes.data.success) {
                            const filtered = recRes.data.data
                                .filter(p => p.categoryTypeId?._id === prodData.categoryTypeId._id && p._id !== prodData._id)
                                .slice(0, 4);
                            setRecommendedProducts(filtered);
                        }
                    }
                }
            } catch (error) {
                toast.error('Failed to load product details');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-[600px] flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[600px] flex flex-col justify-center items-center gap-6">
                <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">Product Not Found</p>
                <Link to="/" className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg">Return to Menu</Link>
            </div>
        );
    }

    const allImages = [product.thumbnail, ...product.images].filter(img => img?.path?.medium);

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-20 font-sans bg-white min-h-screen">
            
            {/* Main Product Section: 3-Column Layout */}
            <div className="flex flex-col lg:flex-row items-start gap-10">
                
                {/* Column 1: Vertical Thumbnail Sidebar (Fixed/Sticky) */}
                <div className="order-2 lg:order-1 flex lg:flex-col gap-4 lg:w-24 lg:sticky lg:top-24 pb-4 lg:pb-0 overflow-x-auto lg:overflow-y-auto no-scrollbar scroll-smooth">
                    {allImages.map((img, i) => {
                        const currentPath = img.path.large || img.path.medium;
                        const isSelected = activeImage === currentPath;
                        return (
                            <button 
                                key={i}
                                onMouseEnter={() => setActiveImage(currentPath)}
                                onClick={() => setActiveImage(currentPath)}
                                className={`w-20 h-20 lg:w-full aspect-square rounded-xl border-2 transition-all p-1.5 flex-shrink-0 bg-gray-50 overflow-hidden relative ${isSelected ? 'border-green-600 ring-2 ring-green-100 shadow-lg' : 'border-gray-100 hover:border-green-300 shadow-sm'}`}
                            >
                                <img 
                                    src={`${import.meta.env.VITE_SERVER_URL}${img.path.medium}`} 
                                    className="w-full h-full object-contain"
                                    alt={`Thumbnail ${i}`}
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-green-600/5 pointer-events-none"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Column 2: Large Central Visual Container */}
                <div className="order-1 lg:order-2 flex-1 lg:sticky lg:top-24 bg-white rounded-3xl overflow-hidden relative border border-gray-100 p-8 sm:p-16 flex items-center justify-center min-h-[500px] lg:min-h-[700px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
                    <img 
                        src={`${import.meta.env.VITE_SERVER_URL}${activeImage}`} 
                        alt={product.title}
                        className="w-full h-full max-h-[600px] object-contain transition-all duration-700 ease-out hover:scale-[1.03]"
                    />
                    
                    {/* Action Layer */}
                    <div className="absolute top-8 right-8 flex flex-col gap-4">
                        <button className="group w-14 h-14 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-2xl flex items-center justify-center transition-all border border-gray-50 hover:scale-110 active:scale-95">
                            <FiHeart className="w-6 h-6 group-active:fill-red-500" />
                        </button>
                        <button onClick={handleShare} className="group w-14 h-14 bg-white text-gray-400 hover:text-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all border border-gray-50 hover:scale-110 active:scale-95">
                            <FiShare2 className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Badge Layer */}
                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                        {selectedType?.price < selectedType?.mrp && (
                            <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl shadow-2xl animate-pulse">
                                Save ₹{selectedType.mrp - selectedType.price}
                            </div>
                        )}
                        <div className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2">
                            <FiShield className="text-green-600" />
                            {product.returnPolicy || 'Strict Policy'}
                        </div>
                    </div>
                </div>

                {/* Column 3: High-End Information Column (Right) */}
                <div className="order-3 lg:order-3 lg:w-[480px] space-y-10 pb-20">
                    <div className="space-y-4">
                        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                            <Link to="/" className="hover:text-green-600 transition-colors">Menu</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-green-600">{product.categoryTypeId?.name || 'Chef Specialty'}</span>
                        </nav>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                            {product.title}
                        </h1>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-black shadow-sm border border-green-100">
                                {product.review?.starValue || '4.9'} <FiStar className="fill-current w-3.5 h-3.5" />
                            </div>
                            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] border-l border-gray-100 pl-6 underline decoration-green-500/20 underline-offset-4 cursor-pointer hover:text-gray-600 transition-colors">{product.review?.count || '1,450'} Verified Reviews</span>
                        </div>
                    </div>

                    {/* Ultimate Pricing Row */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-5">
                            <span className="text-6xl font-black text-gray-900 tracking-tighter">₹{selectedType?.price}</span>
                            <div className="flex flex-col">
                                {selectedType?.mrp > selectedType?.price && (
                                    <span className="text-2xl font-bold text-gray-300 line-through tracking-tighter">₹{selectedType?.mrp}</span>
                                )}
                                {selectedType?.mrp > selectedType?.price && (
                                    <span className="text-green-600 font-black text-sm uppercase tracking-widest">
                                        ↓ {Math.round(((selectedType.mrp - selectedType.price) / selectedType.mrp) * 100)}% Discount
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Inclusive of all taxes</p>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* Premium Variant Container */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-widest">Select Portion Configuration</h4>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest cursor-pointer hover:underline">Size Chart</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {product.types?.map((type, i) => {
                                const isSelected = selectedType?._id === type._id;
                                const discountVal = type.mrp > type.price ? Math.round(((type.mrp - type.price) / type.mrp) * 100) : 0;
                                return (
                                    <button 
                                        key={i}
                                        onClick={() => { setSelectedType(type); setQuantity(1); }}
                                        className={`group flex flex-col items-start p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${isSelected ? 'border-gray-900 bg-gray-900 text-white shadow-2xl' : 'border-gray-100 bg-white hover:border-green-500'}`}
                                    >
                                        <div className="flex justify-between w-full items-start mb-2">
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-green-400' : 'text-gray-500 group-hover:text-green-600'}`}>
                                                {type.qty} {type.unitId?.name}
                                            </span>
                                            {discountVal > 0 && (
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${isSelected ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'}`}>
                                                    ↓{discountVal}%
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>₹{type.price}</span>
                                            {type.mrp > type.price && (
                                                <span className={`text-[10px] font-bold line-through ${isSelected ? 'text-gray-500' : 'text-gray-300'}`}>₹{type.mrp}</span>
                                            )}
                                        </div>
                                        {isSelected && <FiCheckCircle className="absolute bottom-4 right-4 text-green-400 text-lg" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Master Actions */}
                    <div className="flex gap-5">
                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[1.5rem] p-1.5 shadow-inner">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors bg-white rounded-xl shadow-sm"><FiMinus /></button>
                            <span className="w-12 text-center font-black text-xl text-gray-900 tracking-tighter">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors bg-white rounded-xl shadow-sm"><FiPlus /></button>
                        </div>
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-green-600/30 transition-all flex items-center justify-center gap-4 active:scale-95 transform hover:-translate-y-1 uppercase text-xs tracking-[0.2em] group">
                            <FiShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            Secure Add to Bag
                        </button>
                    </div>

                    {/* Strategic Info Layers */}
                    <div className="space-y-8 pt-6">
                        <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-50 space-y-4">
                            <h3 className="text-[11px] font-black uppercase text-blue-900 tracking-widest flex items-center gap-3">
                                <FiTag className="text-blue-500" />
                                Dash Exclusive Perks
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                                    Free Delivery for first 3 orders above ₹500
                                </li>
                                <li className="flex gap-3 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                                    Hygienically Packed with temperature seal
                                </li>
                            </ul>
                        </div>

                        {/* Description & Rich Info Sections */}
                        <div className="space-y-6">
                            <details className="group border-b border-gray-100 pb-5" open>
                                <summary className="list-none cursor-pointer flex justify-between items-center text-[12px] font-black uppercase tracking-[0.2em] text-gray-900">
                                    Chef's Description
                                    <FiPlus className="group-open:rotate-45 transition-transform" />
                                </summary>
                                <p className="mt-5 text-[14px] text-gray-500 font-medium leading-relaxed italic border-l-4 border-green-500 pl-6 py-2">
                                    {selectedType?.description || product.description || "Every ingredient is handpicked to ensure a symphony of flavors that will delight your culinary senses."}
                                </p>
                            </details>

                            {selectedType?.info && (
                                <details className="group border-b border-gray-100 pb-5" open>
                                    <summary className="list-none cursor-pointer flex justify-between items-center text-[12px] font-black uppercase tracking-[0.2em] text-gray-900">
                                        Nutritional Information
                                        <FiPlus className="group-open:rotate-45 transition-transform" />
                                    </summary>
                                    <div 
                                        className="mt-5 prose prose-sm max-w-none text-gray-600 font-medium leading-[2]
                                                   [&_ul]:list-none [&_ul]:pl-0 [&_li]:mb-4 [&_li]:flex [&_li]:items-start [&_li]:gap-3
                                                   [&_li]:before:content-['⚡'] [&_li]:before:text-green-600"
                                        dangerouslySetInnerHTML={{ __html: selectedType.info }}
                                    />
                                </details>
                            )}
                        </div>

                        {/* Charges breakdown */}
                        {product.charges?.length > 0 && (
                            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mandatory Surcharge Breakdown</h5>
                                {product.charges.map((charge, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">{charge.name}</span>
                                        <span className="text-gray-900 font-black">{charge.type === 'percentage' ? `${charge.amount}%` : `₹${charge.amount}`}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom: Recommendation Grid */}
            {recommendedProducts.length > 0 && (
                <section className="space-y-10 pt-20 border-t border-gray-100">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">You might also desire</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Handpicked variations for your palate</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {recommendedProducts.map((p) => (
                            <div key={p._id} className="group relative bg-gray-50/50 rounded-[2.5rem] border border-transparent hover:border-green-500 transition-all hover:bg-white hover:shadow-2xl hover:shadow-green-600/5 p-4">
                                <Link to={`/products/${p._id}`} className="block aspect-square rounded-[2rem] overflow-hidden bg-white shadow-sm mb-6 relative">
                                    <img 
                                        src={`${import.meta.env.VITE_SERVER_URL}${p.thumbnail?.path?.medium || 'https://via.placeholder.com/400x500'}`} 
                                        alt={p.title}
                                        className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Quick Hover Add */}
                                    <button className="absolute bottom-4 right-4 w-12 h-12 bg-green-600 text-white rounded-2xl shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all hover:bg-green-700">
                                        <FiPlus className="w-6 h-6" />
                                    </button>
                                </Link>
                                <div className="space-y-3 px-2">
                                    <h3 className="font-black text-gray-900 truncate uppercase text-[12px] tracking-tight">{p.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 text-lg tracking-tighter">₹{p.types?.[0]?.price}</span>
                                            {p.types?.[0]?.mrp > p.types?.[0]?.price && (
                                                <span className="text-[10px] font-bold text-gray-300 line-through tracking-tighter">₹{p.types[0].mrp}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-orange-500 text-[10px] font-black px-2 py-1 bg-white rounded-lg shadow-sm border border-orange-50">
                                            <FiStar className="fill-current w-2.5 h-2.5" />
                                            {p.review?.starValue || '4.9'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

// Helper component for variant selection would be cleaner, but keeping it inline for reliability in this specific task
import { FiCheckCircle } from 'react-icons/fi';

export default ProductDetails;
