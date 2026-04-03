import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCustomers, setSelectedCustomers] = useState(null);

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

    const statusBodyTemplate = (rowData) => {
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none inline-block ${rowData.active
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                {rowData.active ? 'Active' : 'Inactive'}
            </span>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return (
            <div className="flex flex-col items-end">
                <span className="text-black text-xs font-bold">
                    {new Date(rowData.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {new Date(rowData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        );
    };

    const infoTemplate = (row) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color7 flex items-center justify-center text-color1">
                <i className="pi pi-user text-base" />
            </div>
            <div className="flex flex-col">
                <span className="text-black font-bold text-sm">{row.username}</span>
                <span className="text-[10px] text-gray-500 font-semibold mt-0.5">#{row._id?.slice(-8).toUpperCase()}</span>
            </div>
        </div>
    );

    const contactTemplate = (row) => (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-black">
                <i className="pi pi-envelope text-[10px] text-color1 opacity-80" />
                <span className="text-xs font-bold truncate max-w-[150px]">{row.email || 'NO_RECORD'}</span>
            </div>
            <div className="flex items-center gap-2 text-black">
                <i className="pi pi-phone text-[10px] text-color1 opacity-80" />
                <span className="text-[10px] font-bold">{row.phone}</span>
            </div>
        </div>
    );

    const slTemplate = (data, options) => {
        return <span className="text-xs font-medium text-gray-600">{options.rowIndex + 1}</span>
    };

    const header = (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4">
            <h5 className="m-0 text-xl font-bold text-gray-900 tracking-tight">Customer Directory</h5>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={() => setGlobalFilter('')} className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 text-xs" />
                <span className="relative w-full md:w-auto">
                    <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Keyword Search" className="pl-10 pr-4 py-2 bg-white border border-gray-300 shadow-sm focus:border-color1 outline-none text-gray-900 font-medium rounded-md w-full text-xs" />
                </span>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                    value={customers}
                    paginator
                    rows={15}
                    loading={loading}
                    dataKey="_id"
                    globalFilter={globalFilter}
                    header={header}
                    showGridlines
                    className="p-datatable-customers"
                    emptyMessage={
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <i className="pi pi-search text-3xl text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Synchronizing Database...</p>
                        </div>
                    }
                    selection={selectedCustomers}
                    onSelectionChange={(e) => setSelectedCustomers(e.value)}
                    selectionMode="checkbox"
                    responsiveLayout="stack"
                    breakpoint="960px"
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    paginatorClassName="border-t border-gray-100 py-4"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                    removableSort
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem', textAlign: 'center', background: '#1e293b', borderColor: '#334155' }} />
                    <Column header="Sl" body={slTemplate} className="w-16 text-center" />
                    <Column field="username" header="Identity" sortable body={infoTemplate} />
                    <Column field="email" header="Communication" sortable body={contactTemplate} />
                    <Column field="active" header="Status" sortable body={statusBodyTemplate} className="text-center" />
                    <Column field="createdAt" header="Onboarded" sortable body={dateBodyTemplate} className="text-right" headerClassName="justify-end" />
                </DataTable>
            </div>

            {selectedCustomers?.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10 duration-500 z-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-color1">{selectedCustomers.length} Users Selected</span>
                    <div className="h-4 w-[1px] bg-gray-700" />
                    <div className="flex gap-4">
                        <button className="text-[10px] font-black uppercase tracking-widest text-white hover:text-color1 transition-colors">Bulk Email</button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Terminate</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
