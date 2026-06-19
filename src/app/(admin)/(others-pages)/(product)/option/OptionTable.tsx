"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";
import {OptionService} from "@/service/option.service";
import {ActionTypes} from "@/constant/actionType";
import {Option, OptionData, OptionValue, OptionValueData} from "@/type/Option";
import OptionModal from "@/app/(admin)/(others-pages)/(product)/option/OptionModal";

export default function OptionTable() {
    const {isOpen, openModal, closeModal} = useModal();
    const [activeTab, setActiveTab] = useState<"option" | "value">("option");
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Selections
    const [selectedOption, setSelectedOption] = useState<OptionData>();
    const [selectedOptionValue, setSelectedOptionValue] = useState<OptionValueData>();
    const [action, setAction] = useState<ActionTypes>(ActionTypes.CREATE);

    // Options Data
    const [optionsData, setOptionsData] = useState<OptionData[]>([]);
    const [optionsList, setOptionsList] = useState<OptionData[]>([]); // Full list of options for dropdown
    const [optTotalItems, setOptTotalItems] = useState(0);
    const [optCurrentPage, setOptCurrentPage] = useState(0);
    const [optPageSize] = useState(5);

    // Option Values Data
    const [valuesData, setValuesData] = useState<OptionValueData[]>([]);
    const [valTotalItems, setValTotalItems] = useState(0);
    const [valCurrentPage, setValCurrentPage] = useState(0);
    const [valPageSize] = useState(5);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    // Load full options list for the value creation dropdown
    const fetchOptionsList = async () => {
        try {
            const res = await OptionService.getAll(0, 100);
            setOptionsList(res.data);
        } catch (err) {
            console.error("Error fetching options list:", err);
        }
    };

    const fetchOptions = async () => {
        try {
            const response: Option = await OptionService.getAll(optCurrentPage, optPageSize);
            setOptionsData(response.data);
            setOptTotalItems(response.total);
        } catch (error) {
            console.error("Error fetching options:", error);
        }
    };

    const fetchOptionValues = async () => {
        try {
            const response: OptionValue = await OptionService.getAllValues(valCurrentPage, valPageSize);
            setValuesData(response.data);
            setValTotalItems(response.total);
        } catch (error) {
            console.error("Error fetching option values:", error);
        }
    };

    useEffect(() => {
        fetchOptions();
        fetchOptionsList();
    }, [optCurrentPage, optPageSize]);

    useEffect(() => {
        fetchOptionValues();
        fetchOptionsList();
    }, [valCurrentPage, valPageSize]);

    const openModalCreate = () => {
        setAction(ActionTypes.CREATE);
        openModal();
    };

    const handleEdit = (item: any) => {
        setOpenDropdownId(null);
        setAction(ActionTypes.UPDATE);
        if (activeTab === "option") {
            setSelectedOption(item);
        } else {
            setSelectedOptionValue(item);
        }
        openModal();
    };

    const handleDelete = (item: any) => {
        setOpenDropdownId(null);
        setAction(ActionTypes.DELETE);
        if (activeTab === "option") {
            setSelectedOption(item);
        } else {
            setSelectedOptionValue(item);
        }
        openModal();
    };

    const handleCloseModal = () => {
        setSelectedOption(undefined);
        setSelectedOptionValue(undefined);
        closeModal();
    };

    const applyChange = (_action: string, _payload: any) => {
        if (activeTab === "option") {
            fetchOptions();
        } else {
            fetchOptionValues();
        }
        fetchOptionsList();
    };

    // Paging parameters based on active tab
    const totalItems = activeTab === "option" ? optTotalItems : valTotalItems;
    const pageSize = activeTab === "option" ? optPageSize : valPageSize;
    const currentPage = activeTab === "option" ? optCurrentPage : valCurrentPage;
    const totalPages = Math.ceil(totalItems / pageSize);
    const displayPage = currentPage + 1;

    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (displayPage > 3) {
                pageNumbers.push("...");
            }
            const startPage = Math.max(2, displayPage - 1);
            const endPage = Math.min(totalPages - 1, displayPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            if (displayPage < totalPages - 2) {
                pageNumbers.push("...");
            }
            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            if (activeTab === "option") {
                setOptCurrentPage(page - 1);
            } else {
                setValCurrentPage(page - 1);
            }
        }
    };

    return (
        <div>
            <OptionModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                action={action}
                targetType={activeTab}
                option={selectedOption}
                optionValue={selectedOptionValue}
                optionsList={optionsList}
                onSuccess={applyChange}
            />
            <PageBreadcrumb pageTitle="Product Options"/>
            
            <div className="space-y-6">
                {/* Tabs & Add Button Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex border-b border-gray-200 dark:border-gray-800 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                setActiveTab("option");
                                setOpenDropdownId(null);
                            }}
                            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                                activeTab === "option"
                                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            Options
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("value");
                                setOpenDropdownId(null);
                            }}
                            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                                activeTab === "value"
                                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            Option Values
                        </button>
                    </div>

                    <Button size="sm" variant="primary" onClick={openModalCreate}>
                        + {activeTab === "option" ? "Option" : "Option Value"}
                    </Button>
                </div>

                <ComponentCard>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[800px]">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-center">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400 w-16">
                                                N<sup>o</sup>
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Name
                                            </TableCell>
                                            {activeTab === "value" && (
                                                <TableCell isHeader className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                    Parent Option
                                                </TableCell>
                                            )}
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Created By
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Updated By
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400 w-24">
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                        {activeTab === "option" ? (
                                            optionsData.map((opt, index) => (
                                                <TableRow key={opt.id}>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {optCurrentPage * optPageSize + index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 font-medium">
                                                        {opt.name}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {opt.createdBy?.firstName ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {opt.updatedBy?.firstName ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                        <div className="relative" ref={openDropdownId === opt.id ? dropdownRef : null}>
                                                            <button onClick={() => toggleDropdown(opt.id)} className="p-2">
                                                                <MoreDotIcon/>
                                                            </button>
                                                            {openDropdownId === opt.id && (
                                                                <ActionDropdown
                                                                    data={opt}
                                                                    onEdit={handleEdit}
                                                                    onDelete={handleDelete}
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            valuesData.map((val, index) => (
                                                <TableRow key={val.id}>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {valCurrentPage * valPageSize + index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 font-medium">
                                                        {val.name}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        <span className="px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs font-semibold">
                                                            {val.option?.name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {val.createdBy?.firstName ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {val.updatedBy?.firstName ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                        <div className="relative" ref={openDropdownId === val.id ? dropdownRef : null}>
                                                            <button onClick={() => toggleDropdown(val.id)} className="p-2">
                                                                <MoreDotIcon/>
                                                            </button>
                                                            {openDropdownId === val.id && (
                                                                <ActionDropdown
                                                                    data={val}
                                                                    onEdit={handleEdit}
                                                                    onDelete={handleDelete}
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {totalPages > 0 && (
                                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md p-4">
                                        <button
                                            onClick={() => handlePageChange(displayPage - 1)}
                                            disabled={currentPage === 0}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === 0 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:bg-white/5"
                                            }`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
                                                <path d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" fillRule="evenodd"/>
                                            </svg>
                                        </button>

                                        {getPageNumbers().map((pageNumber, index) =>
                                            pageNumber === "..." ? (
                                                <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 inset-ring inset-ring-gray-700 focus:outline-offset-0">
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber as number)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                                        displayPage === pageNumber
                                                            ? "z-10 bg-indigo-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                                            : "text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5"
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() => handlePageChange(displayPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === totalPages - 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:bg-white/5"
                                            }`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
                                                <path d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd"/>
                                            </svg>
                                        </button>
                                    </nav>
                                )}
                            </div>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
