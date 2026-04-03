import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [lineOptions, setLineOptions] = useState({});
    const menu1 = useRef(null);
    const menu2 = useRef(null);

    const lineData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Revenue',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                backgroundColor: 'var(--color-color1)',
                borderColor: 'var(--color-color1)',
                tension: 0.4
            },
            {
                label: 'Orders',
                data: [28, 48, 40, 19, 86, 27, 90],
                fill: false,
                backgroundColor: '#cbd5e1', // slate-300
                borderColor: '#cbd5e1',
                tension: 0.4
            }
        ]
    };

    useEffect(() => {
        setLineOptions({
            plugins: {
                legend: { labels: { color: '#6b7280', font: { family: 'inherit', weight: 600 } } }
            },
            scales: {
                x: {
                    ticks: { color: '#6b7280', font: { family: 'inherit', weight: 500 } },
                    grid: { color: '#f3f4f6' }
                },
                y: {
                    ticks: { color: '#6b7280', font: { family: 'inherit', weight: 500 } },
                    grid: { color: '#f3f4f6' }
                }
            }
        });
    }, []);

    // Mock Data mimicking Sakai
    const recentSales = [
        { id: '1000', name: 'Bamboo Watch', price: 65, category: 'Accessories' },
        { id: '1001', name: 'Black Watch', price: 72, category: 'Accessories' },
        { id: '1002', name: 'Blue Band', price: 79, category: 'Fitness' },
        { id: '1003', name: 'Blue T-Shirt', price: 29, category: 'Clothing' },
        { id: '1004', name: 'Bracelet', price: 15, category: 'Accessories' }
    ];

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const actionTemplate = () => <Button icon="pi pi-search" text style={{ color: 'var(--color-color1)' }} />;
    const priceTemplate = (rowData) => formatCurrency(rowData.price);

    const salesColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Price', accessor: 'price', render: priceTemplate },
        { header: 'Category', accessor: 'category' },
        { header: 'View', render: actionTemplate, className: 'text-center' }
    ];

    const menuItems = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-minus' }
    ];

    return (
        <div className="grid grid-cols-12 gap-6 p-1.5 lg:p-2 animate-in fade-in duration-500">
            {/* Top 4 Metric Cards */}
            <div className="col-span-12 lg:col-span-6 xl:col-span-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="block text-gray-500 font-semibold mb-2">Orders</span>
                            <div className="text-gray-900 font-black text-2xl">152</div>
                        </div>
                        <div className="flex items-center justify-center bg-blue-50 rounded-xl" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-shopping-cart text-blue-500 text-xl" />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <span className="text-color1 font-bold">24 new </span>
                        <span className="text-gray-400 font-medium">since last visit</span>
                    </div>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-6 xl:col-span-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="block text-gray-500 font-semibold mb-2">Revenue</span>
                            <div className="text-gray-900 font-black text-2xl">$2,100</div>
                        </div>
                        <div className="flex items-center justify-center bg-orange-50 rounded-xl" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-map-marker text-orange-500 text-xl" />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <span className="text-color1 font-bold">+52% </span>
                        <span className="text-gray-400 font-medium">since last week</span>
                    </div>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-6 xl:col-span-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="block text-gray-500 font-semibold mb-2">Customers</span>
                            <div className="text-gray-900 font-black text-2xl">28,441</div>
                        </div>
                        <div className="flex items-center justify-center bg-cyan-50 rounded-xl" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-inbox text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <span className="text-color1 font-bold">520 </span>
                        <span className="text-gray-400 font-medium">newly registered</span>
                    </div>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-6 xl:col-span-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="block text-gray-500 font-semibold mb-2">Comments</span>
                            <div className="text-gray-900 font-black text-2xl">152 Unread</div>
                        </div>
                        <div className="flex items-center justify-center bg-purple-50 rounded-xl" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-comment text-purple-500 text-xl" />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <span className="text-color1 font-bold">85 </span>
                        <span className="text-gray-400 font-medium">responded</span>
                    </div>
                </div>
            </div>

            {/* Left Column (Tables & Lists) */}
            <div className="col-span-12 xl:col-span-6 flex flex-col gap-6">
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Recent Sales</h3>
                    <DataTable
                        value={recentSales}
                        paginator={false}
                        rows={5}
                        responsiveLayout="scroll"
                        className="p-datatable-sm headless-table"
                    >
                        <Column field="name" header="Name" sortable />
                        <Column field="price" header="Price" sortable body={priceTemplate} />
                        <Column field="category" header="Category" sortable />
                        <Column header="View" body={actionTemplate} align="center" style={{ width: '4rem' }} />
                    </DataTable>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Best Selling Products</h3>
                        <div>
                            <Button type="button" icon="pi pi-ellipsis-v" rounded text onClick={(e) => menu1.current?.toggle(e)} className="text-gray-400 hover:text-color1" />
                            <Menu ref={menu1} popup model={menuItems} className="rounded-xl border-gray-100 shadow-xl" />
                        </div>
                    </div>
                    <ul className="space-y-6">
                        <li className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <span className="text-gray-800 font-bold block mb-1">Space T-Shirt</span>
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Clothing</span>
                            </div>
                            <div className="mt-3 md:mt-0 flex items-center">
                                <div className="bg-gray-100 rounded-full overflow-hidden w-24 h-2">
                                    <div className="bg-orange-500 h-full" style={{ width: '50%' }} />
                                </div>
                                <span className="text-orange-500 ml-4 font-bold text-sm">50%</span>
                            </div>
                        </li>
                        <li className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <span className="text-gray-800 font-bold block mb-1">Portal Sticker</span>
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Accessories</span>
                            </div>
                            <div className="mt-3 md:mt-0 flex items-center">
                                <div className="bg-gray-100 rounded-full overflow-hidden w-24 h-2">
                                    <div className="bg-cyan-500 h-full" style={{ width: '16%' }} />
                                </div>
                                <span className="text-cyan-500 ml-4 font-bold text-sm">16%</span>
                            </div>
                        </li>
                        <li className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <span className="text-gray-800 font-bold block mb-1">Supernova Sticker</span>
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Accessories</span>
                            </div>
                            <div className="mt-3 md:mt-0 flex items-center">
                                <div className="bg-gray-100 rounded-full overflow-hidden w-24 h-2">
                                    <div className="bg-pink-500 h-full" style={{ width: '67%' }} />
                                </div>
                                <span className="text-pink-500 ml-4 font-bold text-sm">67%</span>
                            </div>
                        </li>
                        <li className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <span className="text-gray-800 font-bold block mb-1">Wonders Notebook</span>
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Office</span>
                            </div>
                            <div className="mt-3 md:mt-0 flex items-center">
                                <div className="bg-gray-100 rounded-full overflow-hidden w-24 h-2">
                                    <div className="bg-color1 h-full" style={{ width: '35%' }} />
                                </div>
                                <span className="text-color1 ml-4 font-bold text-sm">35%</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Column (Charts & Timelines) */}
            <div className="col-span-12 xl:col-span-6 flex flex-col gap-6">
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Sales Overview</h3>
                    <Chart type="line" data={lineData} options={lineOptions} className="h-full" />
                </div>

                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Notifications</h3>
                        <div>
                            <Button type="button" icon="pi pi-ellipsis-v" rounded text onClick={(e) => menu2.current?.toggle(e)} className="text-gray-400 hover:text-color1" />
                            <Menu ref={menu2} popup model={menuItems} className="rounded-xl border-gray-100 shadow-xl" />
                        </div>
                    </div>

                    <span className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">TODAY</span>
                    <ul className="mb-6 space-y-4">
                        <li className="flex items-start pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-blue-50 rounded-full mr-4">
                                <i className="pi pi-dollar text-blue-500" />
                            </div>
                            <span className="text-gray-800 font-medium leading-relaxed">
                                Richard Jones <span className="text-gray-500 font-normal">has purchased a blue t-shirt for</span> <span className="text-blue-500 font-bold">79$</span>
                            </span>
                        </li>
                        <li className="flex items-start pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-orange-50 rounded-full mr-4">
                                <i className="pi pi-download text-orange-500" />
                            </div>
                            <span className="text-gray-800 font-medium leading-relaxed">
                                Your request for withdrawal of <span className="text-blue-500 font-bold">2500$</span> has been initiated.
                            </span>
                        </li>
                    </ul>

                    <span className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">YESTERDAY</span>
                    <ul className="space-y-4">
                        <li className="flex items-start pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-blue-50 rounded-full mr-4">
                                <i className="pi pi-dollar text-blue-500" />
                            </div>
                            <span className="text-gray-800 font-medium leading-relaxed">
                                Keyser Wick <span className="text-gray-500 font-normal">has purchased a black jacket for</span> <span className="text-blue-500 font-bold">59$</span>
                            </span>
                        </li>
                        <li className="flex items-start">
                            <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-pink-50 rounded-full mr-4">
                                <i className="pi pi-question text-pink-500" />
                            </div>
                            <span className="text-gray-800 font-medium leading-relaxed">
                                Jane Davis <span className="text-gray-500 font-normal">has posted new questions about your product.</span>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
