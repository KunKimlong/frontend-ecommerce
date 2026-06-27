"use client";
import {useRef} from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {useEffect, useState} from "react";
import {PermissionService} from "@/service/permission.service";
import {PermissionData, Permission} from "@/type/Permission";

export default function PermissionTable() {
    const [permissionData, setPermissionData] = useState<PermissionData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [searchName, setSearchName] = useState("");
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (value: string) => {
        setSearchName(value);
        setCurrentPage(0);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            const load = async () => {
                try {
                    const response: Permission = await PermissionService.getAll(0, pageSize, value);
                    if (true) {
                        setPermissionData(response.data);
                        setTotalItems(response.total);
                    }
                } catch (error) {
                    console.error("Error fetching permissions:", error);
                }
            };
            load();
        }, 400);
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const response: Permission = await PermissionService.getAll(currentPage, pageSize, searchName);
                if (isMounted) {
                    setPermissionData(response.data);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [currentPage, pageSize, searchName]);

    const totalPages = Math.ceil(totalItems / pageSize);
    const displayPage = currentPage + 1;

    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1);
            if (displayPage > 3) pageNumbers.push("...");
            const startPage = Math.max(2, displayPage - 1);
            const endPage = Math.min(totalPages - 1, displayPage + 1);
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
            if (displayPage < totalPages - 2) pageNumbers.push("...");
            if (totalPages > 1) pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page - 1);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Permission"/>
            <div className="space-y-6">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 20 20">
                            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent pl-9 pr-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                </div>
                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[800px]">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                N<sup>o</sup>
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Name
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Module
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Description
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {permissionData.map((permission, index) => (
                                            <TableRow key={permission.id}>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {currentPage * pageSize + index + 1}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {permission.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {permission.module}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="block text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {permission.description || "-"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {totalPages > 0 && (
                                    <nav aria-label="Pagination"
                                         className="isolate inline-flex -space-x-px rounded-md p-4">
                                        <button
                                            onClick={() => handlePageChange(displayPage - 1)}
                                            disabled={currentPage === 0}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === 0 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:bg-white/5"
                                            }`}
                                        >
                                            Previous
                                        </button>

                                        {getPageNumbers().map((pageNumber, index) =>
                                            pageNumber === "..." ? (
                                                <span key={`ellipsis-${index}`}
                                                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 inset-ring inset-ring-gray-700 focus:outline-offset-0">
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
                                            Next
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