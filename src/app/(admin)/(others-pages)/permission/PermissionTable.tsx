"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import {useRouter} from "next/navigation";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";
import {PermissionService} from "@/service/permission.service";
import {ActionTypes} from "@/constant/actionType";
import {PermissionData, Permission} from "@/type/Permission";
import PermissionModal from "@/app/(admin)/(others-pages)/permission/PermissionModal";

export default function PermissionTable() {
    const router = useRouter();
    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedPermission, setSelectedPermission] = useState<PermissionData>();

    const [permissionData, setPermissionData] = useState<PermissionData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const fetchPermissions = async () => {
        try {
            const response: Permission = await PermissionService.getAll(currentPage, pageSize);
            setPermissionData(response.data);
            setTotalItems(response.total);
        } catch (error) {
            console.error("Error fetching permissions:", error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const response: Permission = await PermissionService.getAll(currentPage, pageSize);
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
    }, [currentPage, pageSize]);

    const handleEditPermission = (permission: PermissionData) => {
        setOpenDropdownId(null);
        router.push(`/permission/${permission.id}/edit`);
    };

    const handleDeletePermission = (permission: PermissionData) => {
        setOpenDropdownId(null);
        setSelectedPermission(permission);
        openModal();
    };

    const handleCloseModal = () => {
        setSelectedPermission(undefined);
        closeModal();
    };

    const applyPermissionChange = (action: string) => {
        if (action === ActionTypes.DELETE) {
            fetchPermissions();
        }
    };

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
            <PermissionModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                action={ActionTypes.DELETE}
                permission={selectedPermission}
                onSuccess={applyPermissionChange}
            />

            <PageBreadcrumb pageTitle="Permission"/>
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button size="sm" variant="primary" onClick={() => router.push("/permission/create")}>
                        + Permission
                    </Button>
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
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Action
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
                                                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                    <div className="relative"
                                                         ref={openDropdownId === permission.id ? dropdownRef : null}>
                                                        <button onClick={() => toggleDropdown(permission.id)}
                                                                className="p-2">
                                                            <MoreDotIcon/>
                                                        </button>
                                                        {openDropdownId === permission.id && (
                                                            <ActionDropdown
                                                                data={permission}
                                                                onEdit={handleEditPermission}
                                                                onDelete={handleDeletePermission}
                                                                onView={() => router.push(`/permission/${permission.id}`)}
                                                            />
                                                        )}
                                                    </div>
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
