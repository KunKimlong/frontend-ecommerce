"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import React, {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";
import {ColorService} from "@/service/color.service";
import {ActionTypes} from "@/constant/actionType";
import {Color, ColorData} from "@/type/Color";
import ColorModal from "@/app/(admin)/(others-pages)/(product)/color/ColorModal";

export default function ColorTable() {
    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedColor, setSelectedColor] = useState<ColorData>();
    const [action, setAction] = useState<ActionTypes>(ActionTypes.CREATE);

    const [colorData, setColorData] = useState<ColorData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
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

        const fetchColors = async () => {
            try {
                const response: Color = await ColorService.getAll(currentPage, pageSize);
                if (isMounted) {
                    setColorData(response.colorData);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchColors();

        return () => {
            isMounted = false;
        };
    }, [currentPage, pageSize]);

    const handleEditColor = (color: ColorData) => {
        openModal();
        setSelectedColor(color);
        setAction(ActionTypes.UPDATE);
    }

    const handleDeleteColor = (color: ColorData) => {
        openModal();
        setSelectedColor(color);
        setAction(ActionTypes.DELETE);
    }

    const handleCloseModal = () => {
        setSelectedColor(undefined);
        closeModal();
    }

    const applyColorChange = (
        action: string,
        payload: ColorData | number
    ) => {
        if (action === ActionTypes.CREATE || action === ActionTypes.UPDATE || action === ActionTypes.DELETE) {
            const fetchColors = async () => {
                try {
                    const response: Color = await ColorService.getAll(currentPage, pageSize);
                    setColorData(response.colorData);
                    setTotalItems(response.total);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                }
            };
            fetchColors();
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
            setCurrentPage(page - 1);
        }
    };

    return (
        <div>
            <ColorModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                action={action}
                color={selectedColor}
                onSuccess={applyColorChange}
            />
            <PageBreadcrumb pageTitle="Color"/>
            <div className="space-y-6">
                <div className={"flex justify-end"}>
                    <Button size="sm" variant="primary" onClick={openModalCreate}>
                        + Color
                    </Button>
                </div>
                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1102px]">
                                <Table>
                                    {/* Table Header */}
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-center">
                                        <TableRow>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400"
                                            >
                                                N <sup>o</sup>
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400"
                                            >
                                                Name
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400"
                                            >
                                                Code
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400"
                                            >
                                                Created By
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400"
                                            >
                                                Updated By
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400"
                                            >
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                        {colorData.map((color, index) => (
                                            <TableRow key={color.id}>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {currentPage * pageSize + index + 1}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {color.name}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    <div className="flex items-center justify-center gap-2">
                                                            <div
                                                                className="block font-medium text-theme-sm">
                                                              {color.code}
                                                            </div>
                                                            <div className="block" style={{
                                                                width: `30px`,
                                                                height: `30px`,
                                                                borderRadius: `50%`,
                                                                backgroundColor: color.code
                                                            }}></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {color.createdBy.firstName}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {color.updatedBy.firstName}
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                    <div className="relative"
                                                         ref={openDropdownId === color.id ? dropdownRef : null}>
                                                        <button onClick={() => toggleDropdown(color.id)}
                                                                className="p-2">
                                                            <MoreDotIcon/>
                                                        </button>
                                                        {openDropdownId === color.id && (
                                                            <ActionDropdown data={color}
                                                                            onEdit={handleEditColor}
                                                                            onDelete={handleDeleteColor}/>
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
                                        {/* Previous Button */}
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