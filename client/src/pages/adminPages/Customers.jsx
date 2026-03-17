import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/customers');
            if (res.data.success) {
                setCustomers(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch customers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Customers</h2>
                    <p className="text-gray-500 text-sm mt-1">View list of all registered customers on the platform.</p>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold border-b border-gray-200">Username</th>
                            <th className="p-4 font-semibold border-b border-gray-200">Email</th>
                            <th className="p-4 font-semibold border-b border-gray-200">Phone</th>
                            <th className="p-4 font-semibold border-b border-gray-200 items-center justify-center">Status</th>
                            <th className="p-4 font-semibold border-b border-gray-200 text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading customers...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    No customers found.
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="p-4 font-medium text-gray-800">{customer.username}</td>
                                    <td className="p-4 text-gray-600">{customer.email || 'N/A'}</td>
                                    <td className="p-4 text-gray-600">{customer.phone}</td>
                                    <td className="p-4">
                                        {customer.active ? (
                                            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                                <FiCheckCircle className="w-4 h-4" /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                                                <FiXCircle className="w-4 h-4" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right text-gray-500 text-sm">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Customers;
