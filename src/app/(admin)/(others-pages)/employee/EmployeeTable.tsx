"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import React, {useEffect, useRef, useState} from "react";
import Image from "next/image";
import {useModal} from "@/hooks/useModal";
import {useRouter} from "next/navigation";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";
import {Employee, EmployeeData} from "@/type/Employee";
import {EmployeeService} from "@/service/employee.service";
import {ActionTypes} from "@/constant/actionType";
import EmployeeModal from "@/app/(admin)/(others-pages)/employee/EmployeeModal";

export default function EmployeeTable() {
    const router = useRouter();
    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData>();

    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const fetchEmployees = async () => {
        try {
            const response: Employee = await EmployeeService.getAll(currentPage, pageSize);
            setEmployeeData(response.employeeData);
            setTotalItems(response.total);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const response: Employee = await EmployeeService.getAll(currentPage, pageSize);
                if (isMounted) {
                    setEmployeeData(response.employeeData);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, [currentPage, pageSize]);

    const handleEditEmployee = (employee: EmployeeData) => {
        setOpenDropdownId(null);
        router.push(`/employee/${employee.id}/edit`);
    };

    const handleDeleteEmployee = (employee: EmployeeData) => {
        setOpenDropdownId(null);
        setSelectedEmployee(employee);
        openModal();
    };

    const handleCloseModal = () => {
        setSelectedEmployee(undefined);
        closeModal();
    };

    const applyEmployeeChange = (action: string) => {
        if (action === ActionTypes.DELETE) {
            fetchEmployees();
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
            <EmployeeModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                action={ActionTypes.DELETE}
                employee={selectedEmployee}
                onSuccess={applyEmployeeChange}
            />

            <PageBreadcrumb pageTitle="Employee"/>
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button size="sm" variant="primary" onClick={() => router.push("/employee/create")}>
                        + Employee
                    </Button>
                </div>

                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1102px]">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                N<sup>o</sup>
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Profile
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Full Name
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Email
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Phone
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Gender
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Join Date
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400">
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {employeeData.map((employee, index) => (
                                            <TableRow key={employee.id}>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {currentPage * pageSize + index + 1}
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <div
                                                        className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                                        {employee.imageUrl ? (
                                                            <Image
                                                                src={`/media${employee.imageUrl.replace(/^\/api\/asset/, '')}`}
                                                                alt={`${employee.firstName} ${employee.lastName}`}
                                                                width={40}
                                                                height={40}
                                                                className="h-full w-full object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div
                                                                className="h-full w-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-300">
                                                                {`${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase() || "N/A"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.gender == "MALE" ? "Mr. " : "Ms. "}
                                                        {employee.firstName} {employee.lastName}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.email}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.phone || "-"}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.gender || "-"}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span
                                                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.joinDate || "-"}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                    <div className="relative"
                                                         ref={openDropdownId === employee.id ? dropdownRef : null}>
                                                        <button onClick={() => toggleDropdown(employee.id)}
                                                                className="p-2">
                                                            <MoreDotIcon/>
                                                        </button>
                                                        {openDropdownId === employee.id && (
                                                            <ActionDropdown
                                                                data={employee}
                                                                onEdit={handleEditEmployee}
                                                                onDelete={handleDeleteEmployee}
                                                                onView={() => router.push(`/employee/${employee.id}`)}
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
                                            <span className="sr-only">Previous</span>
                                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                                 className="size-5">
                                                <path
                                                    d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                                                    clipRule="evenodd" fillRule="evenodd"/>
                                            </svg>
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
