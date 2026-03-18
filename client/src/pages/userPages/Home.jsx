import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiArrowRight, FiShoppingBag, FiStar, FiClock, FiShield } from 'react-icons/fi';
import { MdOutlineFastfood, MdDirectionsBike } from 'react-icons/md';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [catRes, prodRes] = await Promise.all([
                    api.get('/category'),
                    api.get('/product')
                ]);
                if (catRes.data.success) setCategories(catRes.data.data);
                if (prodRes.data.success) setProducts(prodRes.data.data);
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-20 pb-20 overflow-hidden">
            {/* Hero Section */}
            <section className="relative rounded-[3rem] overflow-hidden bg-green-900 min-h-[500px] flex items-center p-8 lg:p-16">
                <div className="relative z-10 max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-green-100 text-xs font-black uppercase tracking-[0.2em]">
                        <MdDirectionsBike className="text-lg" />
                        Fastest Delivery in Town
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                        Craving? We'll <span className="text-green-400">Dash</span> it to you.
                    </h1>
                    <p className="text-green-100/70 text-lg lg:text-xl font-medium max-w-xl leading-relaxed">
                        Experience the finest local culinary delights delivered fresh, hot, and fast to your doorstep within 30 minutes.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link to="/products" className="px-8 py-5 bg-green-500 hover:bg-green-400 text-green-950 font-black rounded-2xl shadow-xl shadow-green-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3">
                            Explore Menu
                            <FiArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/offers" className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all">
                            View Offers
                        </Link>
                    </div>
                </div>

                {/* Hero Image / Decoration */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-3xl scale-150"></div>
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000"
                        alt="Hero"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                    />
                </div>
            </section>

            {/* Categories Section */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Browse by Category</h2>
                        <p className="text-gray-500 font-bold mt-2 uppercase text-xs tracking-widest">Selected collections for you</p>
                    </div>
                    <Link to="/categories" className="hidden sm:flex items-center gap-2 text-green-600 font-black text-sm uppercase tracking-widest hover:gap-3 transition-all">
                        View All <FiArrowRight />
                    </Link>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar px-2 -mx-2">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="w-32 h-44 bg-gray-100 rounded-3xl animate-pulse shrink-0"></div>
                        ))
                    ) : categories.map((cat) => (
                        <Link
                            key={cat._id}
                            to={`/categories/${cat._id}`}
                            className="group flex flex-col items-center gap-4 shrink-0"
                        >
                            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center p-6 group-hover:bg-green-600 group-hover:border-green-500 group-hover:shadow-2xl group-hover:shadow-green-600/30 transition-all duration-500 overflow-hidden relative">
                                {cat.image?.path?.medium ? (
                                    <img
                                        src={`${import.meta.env.VITE_SERVER_URL}${cat.image.path.medium}`}
                                        alt={cat.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <MdOutlineFastfood className="text-4xl text-gray-300 group-hover:text-white transition-colors" />
                                )}
                                <div className="absolute inset-0 bg-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-sm font-black text-gray-800 uppercase tracking-widest">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Features Banner */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
                <div className="bg-orange-50 p-8 rounded-[2.5rem] flex items-center gap-6 border border-orange-100 hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-orange-500 shrink-0">
                        <FiStar className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Premium Quality</h4>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">Top rated restaurants only</p>
                    </div>
                </div>
                <div className="bg-green-50 p-8 rounded-[2.5rem] flex items-center gap-6 border border-green-100 hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-green-500 shrink-0">
                        <MdDirectionsBike className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Free Delivery</h4>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">On orders above $40</p>
                    </div>
                </div>
                <div className="bg-blue-50 p-8 rounded-[2.5rem] flex items-center gap-6 border border-blue-100 hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-500 shrink-0">
                        <FiShield className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Safe Payments</h4>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">Trusted by millions</p>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Popular Dishes</h2>
                        <p className="text-gray-500 font-bold mt-2 uppercase text-xs tracking-widest">Most ordered items this week</p>
                    </div>
                    <div className="flex gap-2">
                        {['All', 'Veg', 'Non-Veg', 'Healthy'].map((tab) => (
                            <button
                                key={tab}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'All' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-gray-100 rounded-[2.5rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {products.map((product) => (
                            <div key={product._id} className="group relative">
                                <Link to={`/products/${product._id}`} className="block aspect-[4/5] rounded-[2.5rem] bg-gray-100 overflow-hidden relative shadow-sm border border-gray-100 transition-all group-hover:shadow-2xl group-hover:shadow-green-600/10 group-hover:-translate-y-2">
                                    <img
                                        src={`${import.meta.env.VITE_SERVER_URL}${product.thumbnail?.path?.medium || 'https://via.placeholder.com/400x500'}`}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 translate-y-2 lg:translate-y-0 group-hover:translate-y-0 transition-transform">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase text-green-400 tracking-widest">{product.brand?.name || 'Top Choice'}</span>
                                            <h3 className="text-white font-bold text-lg leading-tight truncate">{product.title}</h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-white text-xl">₹{product.types?.[0]?.price || 0}</span>
                                                    {product.types?.[0]?.mrp > product.types?.[0]?.price && (
                                                        <span className="text-[11px] font-bold text-gray-300 line-through">₹{product.types[0].mrp}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2.5 py-1.5 rounded-xl">
                                                    <FiStar className="fill-current w-3 h-3" />
                                                    <span className="text-[10px] font-black">4.9</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Discount Badge */}
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                        20% OFF
                                    </div>
                                </Link>
                                <button className="absolute -bottom-4 right-6 w-14 h-14 bg-white text-gray-900 rounded-2xl shadow-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-gray-100">
                                    <FiShoppingBag className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center pt-8">
                    <Link to="/products" className="px-10 py-5 bg-gray-900 text-white font-black rounded-2xl uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-black transition-all transform hover:scale-105 active:scale-95">
                        Discover More Treats
                    </Link>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-gray-50 rounded-[4rem] p-10 lg:p-20 text-center space-y-8 relative overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Stay in the delicious loop</h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">Subscribe to our newsletter and get exclusive weekly discounts and early access to new restaurant drops.</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-4">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 px-8 py-5 bg-white border-2 border-transparent rounded-[2rem] shadow-sm focus:border-green-500 outline-none transition-all font-bold text-gray-700"
                        />
                        <button className="px-10 py-5 bg-green-600 text-white font-black rounded-[2rem] uppercase text-xs tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all">
                            Join Dash
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
