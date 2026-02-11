"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import React, {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import CategoryModal from "@/app/(admin)/(others-pages)/(product)/category/CategoryModal";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";
import {Category} from "@/type/Category";
import {CategoryService} from "@/service/category.service";
import {ActionTypes} from "@/constant/actionType";

export default function CategoryTable() {
    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category>();
    const [action, setAction] = useState<ActionTypes>(ActionTypes.CREATE);
    const [categories, setCategories] = useState<Category[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // You can make this configurable

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const openModalCreate = () => {
        openModal();
        setAction(ActionTypes.CREATE);
    }

    useEffect(() => {
        let isMounted = true;

        const fetchCategories = async () => {
            const data = await CategoryService.getAll();
            if (isMounted) {
                setCategories(data);
            }
        };

        fetchCategories().then();

        return () => {
            isMounted = false;
        };
    }, [])

    const handleEditCategory = (category: Category) => {
        openModal();
        setSelectedCategory(category);
        setAction(ActionTypes.UPDATE);
    }

    const handleDeleteCategory = (category: Category) => {
        openModal();
        setSelectedCategory(category);
        setAction(ActionTypes.DELETE);
    }

    const handleCloseModal = () => {
        setSelectedCategory(undefined);
        closeModal();
    }

    const applyCategoryChange = (
        action: string,
        payload: Category | number
    ) => {
        setCategories((prev) => {
            switch (action) {
                case ActionTypes.CREATE:
                    return [...prev, payload as Category];

                case ActionTypes.UPDATE:
                    return prev.map((cat) =>
                        cat.id === (payload as Category).id
                            ? (payload as Category)
                            : cat
                    );

                case ActionTypes.DELETE:
                    return prev.filter(
                        (cat) => cat.id !== payload
                    );

                default:
                    return prev;
            }
        });
    };

    // Pagination calculations
    const totalPages = Math.ceil(categories.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            // Show pages around current page
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            // Always show last page
            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div>
            <CategoryModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                action={action}
                category={selectedCategory}
                onSuccess={applyCategoryChange}
            />
            <PageBreadcrumb pageTitle="Category"/>
            <div className="space-y-6">
                <div className={"flex justify-end"}>
                    <Button size="sm" variant="primary" onClick={openModalCreate}>
                        + Category
                    </Button>
                </div>
                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1102px]">
                                <Table>
                                    {/* Table Header */}
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
                                                Name
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Created By
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

                                    {/* Table Body */}
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {currentCategories.map((category, index) => (
                                            <TableRow key={category.id}>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <span
                                                                className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                              {category.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {category.createdBy.firstName}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {category.updatedBy.firstName}
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                    <div className="relative"
                                                         ref={openDropdownId === category.id ? dropdownRef : null}>
                                                        <button onClick={() => toggleDropdown(category.id)}
                                                                className="p-2">
                                                            <MoreDotIcon/>
                                                        </button>
                                                        {openDropdownId === category.id && (
                                                            <ActionDropdown category={category}
                                                                            onEdit={handleEditCategory}
                                                                            onDelete={handleDeleteCategory}/>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Dynamic Pagination */}
                                {totalPages > 0 && (
                                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === 1
                                                    ? 'text-gray-600 cursor-not-allowed'
                                                    : 'text-gray-400 hover:bg-white/5'
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

                                        {/* Page Numbers */}
                                        {getPageNumbers().map((pageNumber, index) => (
                                            pageNumber === '...' ? (
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
                                                        currentPage === pageNumber
                                                            ? 'z-10 bg-indigo-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                                                            : 'text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            )
                                        ))}

                                        {/* Next Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === totalPages
                                                    ? 'text-gray-600 cursor-not-allowed'
                                                    : 'text-gray-400 hover:bg-white/5'
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