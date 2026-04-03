import React, { useState } from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

/**
 * A perfectly responsive, PrimeReact-based global DataTable wrapper.
 */
const DataTable = ({
    title,
    subtitle,
    columns = [],
    data = [],
    loading = false,
    selectedRows,
    onSelectionChange,
    searchPlaceholder = "Find in database...",
    emptyMessage = "No records synchronized.",
    rows = 10,
    actions = null
}) => {
    const [globalFilter, setGlobalFilter] = useState('');

    const header = (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4 px-4 bg-white border-b border-gray-50">
            <div className="flex-1">
                {title && (
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-color1 rounded-full" />
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-3.5">{subtitle}</p>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                <div className="relative w-full md:w-72 group">
                    <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-color1 transition-colors text-sm" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-color1 text-sm font-medium shadow-sm outline-none transition-all h-10"
                    />
                </div>
                {actions}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500 w-full">
            <PrimeDataTable
                value={data}
                paginator
                rows={rows}
                loading={loading}
                dataKey="_id"
                filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                header={header}
                emptyMessage={
                    <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                            <i className="pi pi-search text-2xl text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">{emptyMessage}</p>
                    </div>
                }
                selection={selectedRows}
                onSelectionChange={(e) => onSelectionChange?.(e.value)}
                selectionMode={selectedRows !== undefined ? "checkbox" : null}
                responsiveLayout="stack"
                breakpoint="960px"
                className="p-datatable-sm"
                rowsPerPageOptions={[10, 20, 50]}
                paginatorClassName="border-t border-gray-50 py-3 bg-white"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                removableSort
                size="small"
            >
                {selectedRows !== undefined && <Column selectionMode="multiple" headerStyle={{ width: '3rem', textAlign: 'center' }} />}
                {columns.map((col, idx) => (
                    <Column
                        key={idx}
                        field={col.accessor}
                        header={col.header}
                        sortable={col.sortable !== false}
                        body={col.render}
                        className={`py-3 text-sm ${col.className || ''}`}
                        headerClassName={`bg-gray-50/50 text-gray-600 font-semibold ${col.headerClassName || ''}`}
                    />
                ))}
            </PrimeDataTable>
        </div>
    );
};

export default DataTable;
