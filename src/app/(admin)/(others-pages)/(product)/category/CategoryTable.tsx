"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import CategoryModal from "@/app/(admin)/(others-pages)/(product)/category/CategoryModal";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";
import {Category, CategoryData} from "@/type/Category";
import {CategoryService} from "@/service/category.service";
import {ActionTypes} from "@/constant/actionType";

export default function CategoryTable() {
    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryData>();
    const [action, setAction] = useState<ActionTypes>(ActionTypes.CREATE);

    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing
    const [pageSize] = useState(5);

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
            try {

                const response: Category = await CategoryService.getAll(currentPage, pageSize);
                if (isMounted) {
                    setCategoryData(response.data);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();

        return () => {
            isMounted = false;
        };
    }, [currentPage, pageSize]);

    const handleEditCategory = (category: CategoryData) => {
        openModal();
        setSelectedCategory(category);
        setAction(ActionTypes.UPDATE);
    }

    const handleDeleteCategory = (category: CategoryData) => {
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
        _payload: CategoryData | number
    ) => {
        if (action === ActionTypes.CREATE || action === ActionTypes.UPDATE || action === ActionTypes.DELETE) {
            const fetchCategories = async () => {
                try {
                    const response: Category = await CategoryService.getAll(currentPage, pageSize);
                    setCategoryData(response.data);
                    setTotalItems(response.total);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                }
            };
            fetchCategories();
        }
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
                pageNumbers.push('...');
            }

            const startPage = Math.max(2, displayPage - 1);
            const endPage = Math.min(totalPages - 1, displayPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (displayPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page - 1); // Convert 1-based to 0-based for API
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

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {categoryData.map((category, index) => (
                                            <TableRow key={category.id}>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {currentPage * pageSize + index + 1}
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
                                                            <ActionDropdown data={category}
                                                                            onEdit={handleEditCategory}
                                                                            onDelete={handleDeleteCategory}/>
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
                                                currentPage === 0
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
                                                        displayPage === pageNumber
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
                                            onClick={() => handlePageChange(displayPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === totalPages - 1
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
