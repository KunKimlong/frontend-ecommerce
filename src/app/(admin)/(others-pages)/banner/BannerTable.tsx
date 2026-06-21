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
import {BannerService} from "@/service/banner.service";
import {ActionTypes} from "@/constant/actionType";
import {Banner, BannerData} from "@/type/Banner";
import BannerModal from "@/app/(admin)/(others-pages)/banner/BannerModal";

export default function BannerTable() {
    const router = useRouter();
    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedBanner, setSelectedBanner] = useState<BannerData>();

    const [bannerData, setBannerData] = useState<BannerData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(5);
    const ACTIVE = "Active";
    const INACTIVE = "Inactive";

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

    const fetchBanners = async () => {
        try {
            const response: Banner = await BannerService.getAll(currentPage, pageSize);
            setBannerData(response.data);
            setTotalItems(response.total);
        } catch (error) {
            console.error("Error fetching banners:", error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const response: Banner = await BannerService.getAll(currentPage, pageSize);
                if (isMounted) {
                    setBannerData(response.data);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [currentPage, pageSize]);

    const handleEditBanner = (banner: BannerData) => {
        setOpenDropdownId(null);
        router.push(`/banner/${banner.id}/edit`);
    };

    const handleDeleteBanner = (banner: BannerData) => {
        setOpenDropdownId(null);
        setSelectedBanner(banner);
        openModal();
    };

    const handleCloseModal = () => {
        setSelectedBanner(undefined);
        closeModal();
    };

    const applyBannerChange = (action: string) => {
        if (action === ActionTypes.DELETE) {
            fetchBanners();
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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatus = (endAt: string) => {
        if (!endAt) return INACTIVE;

        const today = new Date();
        const endDate = new Date(endAt);

        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (endDate > today) {
            return ACTIVE;
        } else {
            return INACTIVE;
        }
    };

    return (
        <div>
            <BannerModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                action={ActionTypes.DELETE}
                banner={selectedBanner}
                onSuccess={applyBannerChange}
            />

            <PageBreadcrumb pageTitle="Banner"/>
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push("/banner/create")}
                    >
                        + Banner
                    </Button>
                </div>
                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1102px]">
                                <Table>
                                    <TableHeader
                                        className="border-b border-gray-100 dark:border-white/[0.05] text-center">
                                        <TableRow>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                N<sup>o</sup>
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Label
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Header
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Type
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Product Name
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Start
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                End
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Status
                                            </TableCell>
                                            <TableCell isHeader
                                                       className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400">
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody
                                        className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                        {bannerData.map((banner, index) => (
                                            <TableRow key={banner.id}>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {currentPage * pageSize + index + 1}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {banner.label}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {banner.headerLabel}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    <span
                                                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        {banner.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {banner.product ? (
                                                        <span>
                                                            {banner.product.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {formatDate(banner.startAt)}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {formatDate(banner.endAt)}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
                                                            getStatus(banner.endAt) === INACTIVE ? "bg-error-900" : "bg-green-600"
                                                        }`}>
                                                      {getStatus(banner.endAt)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                    <div className="relative"
                                                         ref={openDropdownId === banner.id ? dropdownRef : null}>
                                                        <button onClick={() => toggleDropdown(banner.id)}
                                                                className="p-2">
                                                            <MoreDotIcon/>
                                                        </button>
                                                        {openDropdownId === banner.id && (
                                                            <ActionDropdown
                                                                data={banner}
                                                                onEdit={handleEditBanner}
                                                                onDelete={handleDeleteBanner}
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