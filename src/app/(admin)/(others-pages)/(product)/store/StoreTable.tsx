
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import React, {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import {MoreDotIcon, PencilIcon} from "@/icons";
import {Store, StoreData} from "@/type/Store";
import {StoreService} from "@/service/store.service";
import StoreModal from "@/app/(admin)/(others-pages)/(product)/store/StoreModal";

const toMediaLogoUrl = (logoPath?: string | null) => {
    if (!logoPath) return null;
    return `/media${logoPath.replace(/^\/api\/asset/, "")}`;
};

export default function StoreTable() {
    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedStore, setSelectedStore] = useState<StoreData>();

    const [storeData, setStoreData] = useState<StoreData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(5);

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

    const fetchStores = async () => {
        try {
            const response: Store = await StoreService.getAll(currentPage, pageSize, {
                sortBy: "id",
                ascending: false,
            });
            setStoreData(response.data);
            setTotalItems(response.total);
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadStores = async () => {
            try {
                const response: Store = await StoreService.getAll(currentPage, pageSize, {
                    sortBy: "id",
                    ascending: false,
                });
                if (isMounted) {
                    setStoreData(response.data);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };

        loadStores();

        return () => {
            isMounted = false;
        };
    }, [currentPage, pageSize]);

    const handleEditStore = (store: StoreData) => {
        setOpenDropdownId(null);
        setSelectedStore(store);
        openModal();
    };

    const handleCloseModal = () => {
        setSelectedStore(undefined);
        closeModal();
    };

    const applyStoreChange = (payload: StoreData) => {
        fetchStores();
    };

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
            setCurrentPage(page - 1);
        }
    };

    return (
        <div>
            <StoreModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                store={selectedStore}
                onSuccess={applyStoreChange}
            />
            <PageBreadcrumb pageTitle="Store"/>
            <div className="space-y-6">
                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1200px]">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                N <sup>o</sup>
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Logo
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Name
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Location
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Support
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Status
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Updated By
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {storeData.map((store, index) => {
                                            const logoUrl = toMediaLogoUrl(store.logoPath);
                                            return (
                                                <TableRow key={store.id}>
                                                    <TableCell
                                                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                        {currentPage * pageSize + index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        {logoUrl ? (
                                                            <img
                                                                src={logoUrl}
                                                                alt={store.name}
                                                                className="h-10 w-10 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-400 text-theme-sm">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <span
                                                            className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                            {store.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {store.description}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                        {store.location}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                                                        <div className="text-gray-700 dark:text-gray-300">
                                                            {store.supportEmail}
                                                        </div>
                                                        <div className="text-gray-500 dark:text-gray-400">
                                                            {store.supportPhoneNumber}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-start">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                store.isActive
                                                                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                                                                    : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                                                            }`}
                                                        >
                                                            {store.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                        {store.updatedBy
                                                            ? `${store.updatedBy.firstName} ${store.updatedBy.lastName}`
                                                            : "-"}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                        <div className="relative"
                                                             ref={openDropdownId === store.id ? dropdownRef : null}>
                                                            <button onClick={() => toggleDropdown(store.id)}
                                                                    className="p-2">
                                                                <MoreDotIcon/>
                                                            </button>
                                                            {openDropdownId === store.id && (
                                                                <div
                                                                    className="absolute right-0 mt-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg z-50">
                                                                    <button
                                                                        className="flex w-full items-center gap-2 px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                                                                        onClick={() => handleEditStore(store)}
                                                                    >
                                                                        <PencilIcon/>
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {totalPages > 0 && (
                                    <nav aria-label="Pagination"
                                         className="isolate inline-flex -space-x-px rounded-md p-4">
                                        <button
                                            onClick={() => handlePageChange(displayPage - 1)}
                                            disabled={currentPage === 0}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === 0
                                                    ? "text-gray-600 cursor-not-allowed"
                                                    : "text-gray-400 hover:bg-white/5"
                                            }`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                                 className="size-5">
                                                <path
                                                    d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                                                    clipRule="evenodd" fillRule="evenodd"/>
                                            </svg>
                                        </button>

                                        {getPageNumbers().map((pageNumber, index) => (
                                            pageNumber === "..." ? (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 inset-ring inset-ring-gray-700 focus:outline-offset-0"
                                                >
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
                                        ))}

                                        <button
                                            onClick={() => handlePageChange(displayPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === totalPages - 1
                                                    ? "text-gray-600 cursor-not-allowed"
                                                    : "text-gray-400 hover:bg-white/5"
                                            }`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                                 className="size-5">
                                                <path
                                                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                                                    clipRule="evenodd" fillRule="evenodd"/>
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
