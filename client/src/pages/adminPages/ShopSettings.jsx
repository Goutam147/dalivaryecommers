import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
    FiSettings, FiMail, FiMapPin, FiSmartphone,
    FiCreditCard, FiTruck, FiSave, FiImage,
    FiLock, FiGlobe, FiInfo, FiLayers, FiPercent,
    FiChevronDown
} from 'react-icons/fi';

const ShopSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [pincodeOptions, setPincodeOptions] = useState([]);
    const [fetchingPincode, setFetchingPincode] = useState(false);

    const [formData, setFormData] = useState({
        appName: '',
        email: '',
        phone: '',
        ownerName: '',
        prefix: '',
        CopyrightMsg: '',
        logo: '',
        fevicon: '',
        address: {
            addressLine1: '',
            city: '',
            post: '',
            block: '',
            dist: '',
            state: '',
            pincode: '',
            Latitude: '',
            Longitude: ''
        },
        gst: {
            set: false,
            gstNo: ''
        },
        whatsappApi: {
            set: false,
            apiKey: '',
            customerReg: { set: false, template: '' },
            orderConfirm: { set: false, template: '' },
            orderShiped: { set: false, template: '' },
            orderDelivered: { set: false, template: '' },
            orderCancel: { set: false, template: '' },
            otp: { set: false, template: '' }
        },
        smtp: {
            set: false,
            host: '',
            port: '',
            user: '',
            pass: '',
            from: '',
            fromName: '',
            apiKey: ''
        },
        gmapapi: {
            set: false,
            apiKey: ''
        },
        paymentMethod: {
            razorpay: { set: false, apiKey: '', secretKey: '' },
            paytm: { set: false, apiKey: '', secretKey: '' },
            cashOnDelivery: { set: false },
            nodelivery: { set: false }
        },
        miniFreeDelivery: {
            set: false,
            amount: ''
        },
        availablePincode: [],
        theme: []
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await api.get('/shop');
                if (res.data.success && res.data.data) {
                    // Merge with initial state to ensure nested objects exist
                    setFormData(prev => ({
                        ...prev,
                        ...res.data.data,
                        address: { ...prev.address, ...res.data.data.address },
                        gst: { ...prev.gst, ...res.data.data.gst },
                        whatsappApi: { ...prev.whatsappApi, ...res.data.data.whatsappApi },
                        smtp: { ...prev.smtp, ...res.data.data.smtp },
                        gmapapi: { ...prev.gmapapi, ...res.data.data.gmapapi },
                        paymentMethod: {
                            ...prev.paymentMethod,
                            ...res.data.data.paymentMethod,
                            razorpay: { ...prev.paymentMethod.razorpay, ...res.data.data.paymentMethod?.razorpay },
                            paytm: { ...prev.paymentMethod.paytm, ...res.data.data.paymentMethod?.paytm },
                            cashOnDelivery: { ...prev.paymentMethod.cashOnDelivery, ...res.data.data.paymentMethod?.cashOnDelivery },
                            nodelivery: { ...prev.paymentMethod.nodelivery, ...res.data.data.paymentMethod?.nodelivery },
                        },
                        miniFreeDelivery: { ...prev.miniFreeDelivery, ...res.data.data.miniFreeDelivery }
                    }));
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to load shop settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handlePincodeSearch = async (pincode) => {
        if (pincode.length !== 6) return;
        try {
            setFetchingPincode(true);
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0].Status === "Success") {
                const offices = data[0].PostOffice;
                setPincodeOptions(offices);

                // If only one office, auto-select it
                if (offices.length === 1) {
                    const office = offices[0];
                    setFormData(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            post: office.Name,
                            block: office.Block,
                            dist: office.District,
                            state: office.State,
                            city: office.Division // Using Division as City fallback if not present
                        }
                    }));
                } else {
                    toast.info(`Found ${offices.length} post offices for this pincode`);
                }
            } else {
                setPincodeOptions([]);
                toast.warning("No details found for this pincode");
            }
        } catch (error) {
            console.error("Error fetching pincode details:", error);
            toast.error("Failed to fetch address details");
        } finally {
            setFetchingPincode(false);
        }
    };

    const handleChange = (e, section = null, subsection = null) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            if (subsection && section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [subsection]: {
                            ...prev[section][subsection],
                            [name]: val
                        }
                    }
                };
            } else if (section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [name]: val
                    }
                };
            } else {
                return {
                    ...prev,
                    [name]: val
                };
            }
        });

        if (name === 'pincode' && val.length === 6) {
            handlePincodeSearch(val);
        }
    };

    const handleOfficeSelect = (e) => {
        const officeName = e.target.value;
        const office = pincodeOptions.find(o => o.Name === officeName);
        if (office) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    post: office.Name,
                    block: office.Block,
                    dist: office.District,
                    state: office.State,
                    city: office.Division
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    post: officeName
                }
            }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await api.post('/shop', formData);
            if (res.data.success) {
                toast.success("Settings updated successfully!");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error(error.response?.data?.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <FiSettings /> },
        { id: 'address', label: 'Address', icon: <FiMapPin /> },
        { id: 'smtp', label: 'SMTP', icon: <FiMail /> },
        { id: 'api', label: 'API & Integration', icon: <FiGlobe /> },
        { id: 'payment', label: 'Payment Methods', icon: <FiCreditCard /> },
        { id: 'delivery', label: 'Delivery', icon: <FiTruck /> },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop Settings</h1>
                <p className="text-gray-500 mt-2 text-lg">Configure your store's core functionality and integrations.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-72 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                        <nav className="flex flex-col p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20 translate-x-1'
                                        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                                        }`}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                            {/* Tab Header */}
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
                                        {tabs.find(t => t.id === activeTab)?.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                                        {tabs.find(t => t.id === activeTab)?.label} Settings
                                    </h2>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-70 flex items-center gap-2 transition-all transform active:scale-95"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-green-200 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <FiSave />
                                    )}
                                    Save Changes
                                </button>
                            </div>

                            <div className="p-8">
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">App Name</label>
                                            <input
                                                type="text" name="appName" value={formData.appName} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="My Awesome Shop" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Owner Name</label>
                                            <input
                                                type="text" name="ownerName" value={formData.ownerName} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="John Doe" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Support Email</label>
                                            <input
                                                type="email" name="email" value={formData.email} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="support@example.com" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Support Phone</label>
                                            <input
                                                type="text" name="phone" value={formData.phone} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="+91 9876543210" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">GST Number</label>
                                            <div className="flex gap-4 items-center mb-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox" name="set" checked={formData.gst?.set}
                                                        onChange={(e) => handleChange(e, 'gst')}
                                                        className="w-5 h-5 accent-green-600 rounded"
                                                    />
                                                    <span className="text-sm font-semibold text-gray-600">Enable GST</span>
                                                </label>
                                            </div>
                                            <input
                                                type="text" name="gstNo" value={formData.gst?.gstNo} onChange={(e) => handleChange(e, 'gst')}
                                                disabled={!formData.gst?.set}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium disabled:opacity-50"
                                                placeholder="GSTIN12345678"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Order ID Prefix</label>
                                            <input
                                                type="text" name="prefix" value={formData.prefix} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="ORD-"
                                            />
                                        </div>
                                        <div className="col-span-full space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Copyright Message</label>
                                            <textarea
                                                name="CopyrightMsg" value={formData.CopyrightMsg} onChange={handleChange}
                                                rows="2"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium resize-none"
                                                placeholder="© 2024 Your Shop Name. All rights reserved."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Address Settings */}
                                {activeTab === 'address' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-full space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Address Line 1</label>
                                            <input
                                                type="text" name="addressLine1" value={formData.address?.addressLine1}
                                                onChange={(e) => handleChange(e, 'address')}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="123 Street, Area" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center justify-between">
                                                Pincode
                                                {fetchingPincode && <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>}
                                            </label>
                                            <input
                                                type="text" name="pincode" value={formData.address?.pincode}
                                                onChange={(e) => handleChange(e, 'address')}
                                                maxLength={6}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-bold text-green-700"
                                                placeholder="395001" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">City / Division</label>
                                            <input
                                                type="text" name="city" value={formData.address?.city}
                                                onChange={(e) => handleChange(e, 'address')}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="Surat" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Post Office</label>
                                            <div className="relative">
                                                {pincodeOptions.length > 0 ? (
                                                    <>
                                                        <select
                                                            name="post" value={formData.address?.post}
                                                            onChange={handleOfficeSelect}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium appearance-none pr-10"
                                                        >
                                                            <option value="">Select Post Office</option>
                                                            {pincodeOptions.map((office, idx) => (
                                                                <option key={idx} value={office.Name}>{office.Name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                            <FiChevronDown />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <input
                                                        type="text" name="post" value={formData.address?.post}
                                                        onChange={(e) => handleChange(e, 'address')}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                        placeholder="Post Office Name" required
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Block / Taluka</label>
                                            <div className="relative">
                                                {pincodeOptions.length > 0 ? (
                                                    <>
                                                        <select
                                                            name="block" value={formData.address?.block}
                                                            onChange={(e) => handleChange(e, 'address')}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium appearance-none pr-10"
                                                        >
                                                            <option value="">Select Block</option>
                                                            {[...new Set(pincodeOptions.map(o => o.Block))].map((block, idx) => (
                                                                <option key={idx} value={block}>{block}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                            <FiChevronDown />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <input
                                                        type="text" name="block" value={formData.address?.block}
                                                        onChange={(e) => handleChange(e, 'address')}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                        placeholder="Sector 5" required
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">District</label>
                                            <input
                                                type="text" name="dist" value={formData.address?.dist}
                                                onChange={(e) => handleChange(e, 'address')}
                                                readOnly={pincodeOptions.length > 0}
                                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium ${pincodeOptions.length > 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
                                                placeholder="District Name" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">State</label>
                                            <input
                                                type="text" name="state" value={formData.address?.state}
                                                onChange={(e) => handleChange(e, 'address')}
                                                readOnly={pincodeOptions.length > 0}
                                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium ${pincodeOptions.length > 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
                                                placeholder="State Name" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Latitude</label>
                                            <input
                                                type="text" name="Latitude" value={formData.address?.Latitude}
                                                onChange={(e) => handleChange(e, 'address')}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="21.1702"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Longitude</label>
                                            <input
                                                type="text" name="Longitude" value={formData.address?.Longitude}
                                                onChange={(e) => handleChange(e, 'address')}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                placeholder="72.8311"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* SMTP Settings */}
                                {activeTab === 'smtp' && (
                                    <div className="space-y-6">
                                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-green-50 rounded-2xl border border-green-100 mb-6">
                                            <input
                                                type="checkbox" name="set" checked={formData.smtp?.set}
                                                onChange={(e) => handleChange(e, 'smtp')}
                                                className="w-6 h-6 accent-green-600 rounded"
                                            />
                                            <div>
                                                <p className="font-bold text-green-800">Enable SMTP Service</p>
                                                <p className="text-xs text-green-600">Toggle this to use custom mail server for notifications.</p>
                                            </div>
                                        </label>

                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${!formData.smtp?.set ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">SMTP Host</label>
                                                <input
                                                    type="text" name="host" value={formData.smtp?.host} onChange={(e) => handleChange(e, 'smtp')}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                    placeholder="smtp.gmail.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">SMTP Port</label>
                                                <input
                                                    type="text" name="port" value={formData.smtp?.port} onChange={(e) => handleChange(e, 'smtp')}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                    placeholder="587"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">Username / Email</label>
                                                <input
                                                    type="text" name="user" value={formData.smtp?.user} onChange={(e) => handleChange(e, 'smtp')}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                                                <input
                                                    type="password" name="pass" value={formData.smtp?.pass} onChange={(e) => handleChange(e, 'smtp')}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">From Email</label>
                                                <input
                                                    type="text" name="from" value={formData.smtp?.from} onChange={(e) => handleChange(e, 'smtp')}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                    placeholder="no-reply@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">From Name</label>
                                                <input
                                                    type="text" name="fromName" value={formData.smtp?.fromName} onChange={(e) => handleChange(e, 'smtp')}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium"
                                                    placeholder="My Awesome Shop"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* API & Integration */}
                                {activeTab === 'api' && (
                                    <div className="space-y-8">
                                        {/* WhatsApp API */}
                                        <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50">
                                            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                                                <FiSmartphone className="text-green-600" /> WhatsApp API
                                            </h3>
                                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                                <input
                                                    type="checkbox" name="set" checked={formData.whatsappApi?.set}
                                                    onChange={(e) => handleChange(e, 'whatsappApi')}
                                                    className="w-5 h-5 accent-green-600 rounded"
                                                />
                                                <span className="text-sm font-semibold text-gray-600">Enable WhatsApp Notifications</span>
                                            </label>
                                            <input
                                                type="text" name="apiKey" value={formData.whatsappApi?.apiKey}
                                                onChange={(e) => handleChange(e, 'whatsappApi')}
                                                disabled={!formData.whatsappApi?.set}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium disabled:opacity-50"
                                                placeholder="Enter WhatsApp API Key"
                                            />
                                        </div>

                                        <div className="space-y-6 pt-4 border-t border-gray-100">
                                            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                                    <FiMail className="w-4 h-4" />
                                                </div>
                                                WhatsApp Message Templates
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { id: 'customerReg', label: 'Customer Registration' },
                                                    { id: 'orderConfirm', label: 'Order Confirmation' },
                                                    { id: 'orderShiped', label: 'Order Shipped' },
                                                    { id: 'orderDelivered', label: 'Order Delivered' },
                                                    { id: 'orderCancel', label: 'Order Cancelled' },
                                                    { id: 'otp', label: 'OTP Message' }
                                                ].map((tmpl) => (
                                                    <div key={tmpl.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-gray-700 text-sm">{tmpl.label}</span>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox" name="set"
                                                                    checked={formData.whatsappApi?.[tmpl.id]?.set}
                                                                    onChange={(e) => handleChange(e, 'whatsappApi', tmpl.id)}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                            </label>
                                                        </div>
                                                        <textarea
                                                            name="template"
                                                            value={formData.whatsappApi?.[tmpl.id]?.template}
                                                            onChange={(e) => handleChange(e, 'whatsappApi', tmpl.id)}
                                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all font-medium text-sm"
                                                            rows="3"
                                                            placeholder={`Enter ${tmpl.label} template...`}
                                                            disabled={!formData.whatsappApi?.[tmpl.id]?.set}
                                                        ></textarea>
                                                        <p className="text-[10px] text-gray-400 italic">Use placeholders like {'{name}'}, {'{orderId}'}, {'{otp}'} etc.</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Google Maps API */}
                                        <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50">
                                            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                                                <FiMapPin className="text-blue-600" /> Google Maps API
                                            </h3>
                                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                                <input
                                                    type="checkbox" name="set" checked={formData.gmapapi?.set}
                                                    onChange={(e) => handleChange(e, 'gmapapi')}
                                                    className="w-5 h-5 accent-blue-600 rounded"
                                                />
                                                <span className="text-sm font-semibold text-gray-600">Enable Google Maps Integration</span>
                                            </label>
                                            <input
                                                type="text" name="apiKey" value={formData.gmapapi?.apiKey}
                                                onChange={(e) => handleChange(e, 'gmapapi')}
                                                disabled={!formData.gmapapi?.set}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-medium disabled:opacity-50"
                                                placeholder="Enter Google Maps API Key"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Payment Methods */}
                                {activeTab === 'payment' && (
                                    <div className="space-y-8">
                                        {/* Razorpay */}
                                        <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="flex items-center gap-2 font-bold text-gray-800">
                                                    <FiCreditCard className="text-indigo-600" /> Razorpay
                                                </h3>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox" name="set" checked={formData.paymentMethod?.razorpay?.set}
                                                        onChange={(e) => handleChange(e, 'paymentMethod', 'razorpay')}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!formData.paymentMethod?.razorpay?.set ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input
                                                    type="text" name="apiKey" value={formData.paymentMethod?.razorpay?.apiKey}
                                                    onChange={(e) => handleChange(e, 'paymentMethod', 'razorpay')}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium"
                                                    placeholder="Key ID"
                                                />
                                                <input
                                                    type="text" name="secretKey" value={formData.paymentMethod?.razorpay?.secretKey}
                                                    onChange={(e) => handleChange(e, 'paymentMethod', 'razorpay')}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium"
                                                    placeholder="Key Secret"
                                                />
                                            </div>
                                        </div>

                                        {/* Paytm */}
                                        <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="flex items-center gap-2 font-bold text-gray-800">
                                                    <FiSmartphone className="text-blue-500" /> Paytm
                                                </h3>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox" name="set" checked={formData.paymentMethod?.paytm?.set}
                                                        onChange={(e) => handleChange(e, 'paymentMethod', 'paytm')}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                                </label>
                                            </div>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!formData.paymentMethod?.paytm?.set ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input
                                                    type="text" name="apiKey" value={formData.paymentMethod?.paytm?.apiKey}
                                                    onChange={(e) => handleChange(e, 'paymentMethod', 'paytm')}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium"
                                                    placeholder="Merchant ID"
                                                />
                                                <input
                                                    type="text" name="secretKey" value={formData.paymentMethod?.paytm?.secretKey}
                                                    onChange={(e) => handleChange(e, 'paymentMethod', 'paytm')}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium"
                                                    placeholder="Merchant Key"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <label className="flex items-center justify-between p-6 rounded-3xl border border-gray-100 bg-green-50/50 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                                        <FiTruck />
                                                    </div>
                                                    <span className="font-bold text-gray-800">Cash On Delivery</span>
                                                </div>
                                                <input
                                                    type="checkbox" name="set" checked={formData.paymentMethod?.cashOnDelivery?.set}
                                                    onChange={(e) => handleChange(e, 'paymentMethod', 'cashOnDelivery')}
                                                    className="w-6 h-6 accent-green-600"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-6 rounded-3xl border border-gray-100 bg-red-50/50 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                                        <FiLock />
                                                    </div>
                                                    <span className="font-bold text-gray-800">No Delivery (Pickup Only)</span>
                                                </div>
                                                <input
                                                    type="checkbox" name="set" checked={formData.paymentMethod?.nodelivery?.set}
                                                    onChange={(e) => handleChange(e, 'paymentMethod', 'nodelivery')}
                                                    className="w-6 h-6 accent-red-600"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Settings */}
                                {activeTab === 'delivery' && (
                                    <div className="space-y-8">
                                        <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">Minimum Free Delivery</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Orders above this amount will have zero delivery fees.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox" name="set" checked={formData.miniFreeDelivery?.set}
                                                        onChange={(e) => handleChange(e, 'miniFreeDelivery')}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                </label>
                                            </div>
                                            <div className={`transition-all duration-300 ${!formData.miniFreeDelivery?.set ? 'opacity-50 pointer-events-none max-h-0 overflow-hidden' : 'max-h-40 opacity-100'}`}>
                                                <div className="relative mt-4">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                    <input
                                                        type="number" name="amount" value={formData.miniFreeDelivery?.amount}
                                                        onChange={(e) => handleChange(e, 'miniFreeDelivery')}
                                                        className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-bold text-xl text-green-700"
                                                        placeholder="500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50">
                                            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                                                <FiLayers className="text-orange-500" /> Servicable Pincodes
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-6">Enter pincodes separated by commas where you provide delivery.</p>
                                            <textarea
                                                value={formData.availablePincode?.join(', ')}
                                                onChange={(e) => setFormData(prev => ({ ...prev, availablePincode: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium resize-none min-h-[120px]"
                                                placeholder="395001, 395002, 395003"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShopSettings;
