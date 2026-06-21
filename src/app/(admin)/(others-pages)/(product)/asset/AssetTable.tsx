"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";  
import {useEffect, useState} from "react";
import {useModal} from "@/hooks/useModal";
import {useUser} from "@/context/UserContext";
import {ActionTypes} from "@/constant/actionType";
import {InfoIcon, TrashBinIcon} from "@/icons";
import {AssetService} from "@/service/asset.service";
import {Asset, AssetData} from "@/type/Asset";
import AssetModal from "@/app/(admin)/(others-pages)/(product)/asset/AssetModal";
import BulkAssetModal from "@/app/(admin)/(others-pages)/(product)/asset/BulkAssetModal";

export default function AssetTable() {
    const {isOpen, openModal, closeModal} = useModal();
    const {can} = useUser();
    const {isOpen: isBulkOpen, openModal: openBulkModal, closeModal: closeBulkModal} = useModal();
    const [selectedAsset, setSelectedAsset] = useState<AssetData>();
    const [action, setAction] = useState<ActionTypes>(ActionTypes.CREATE);

    const [assetData, setAssetData] = useState<AssetData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(8);


    const openModalCreate = () => {
        openModal();
        setAction(ActionTypes.CREATE);
    }

    const openModalDelete = (asset: AssetData) => {
        openModal();
        setSelectedAsset(asset);
        setAction(ActionTypes.DELETE);
    }

    useEffect(() => {
        let isMounted = true;

        const fetchAssets = async () => {
            try {
                const response: Asset = await AssetService.getAll(currentPage, pageSize);
                if (isMounted) {
                    setAssetData(response.data);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error('Error fetching assets:', error);
            }
        };

        fetchAssets();

        return () => {
            isMounted = false;
        };
    }, [currentPage, pageSize]);

    const handleCloseModal = () => {
        setSelectedAsset(undefined);
        closeModal();
    }

    const applyCategoryChange = (
        action: string
    ) => {
        if (action === ActionTypes.CREATE|| action === ActionTypes.DELETE) {
            const fetchAssets = async () => {
                try {
                    const response: Asset = await AssetService.getAll(currentPage, pageSize);
                    setAssetData(response.data);
                    setTotalItems(response.total);
                } catch (error) {
                    console.error('Error fetching assets:', error);
                }
            };
            fetchAssets();
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
            if (displayPage > 3) pageNumbers.push('...');
            const startPage = Math.max(2, displayPage - 1);
            const endPage = Math.min(totalPages - 1, displayPage + 1);
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
            if (displayPage < totalPages - 2) pageNumbers.push('...');
            if (totalPages > 1) pageNumbers.push(totalPages);
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
            <AssetModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                action={action}
                asset={selectedAsset}
                onSuccess={applyCategoryChange}
            />
            <BulkAssetModal
                isOpen={isBulkOpen}
                closeModal={closeBulkModal}
                onSuccess={applyCategoryChange}
            />
            <PageBreadcrumb pageTitle="Asset"/>
            <div className="space-y-6">
                <div className="flex justify-end gap-3">
                    {can("asset:create") && (
                        <button
                            onClick={openBulkModal}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                 className="size-4">
                                <path
                                    d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z"/>
                                <path
                                    d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"/>
                            </svg>
                            Upload Bulk
                        </button>
                    )}
                    {can("asset:create") && (
                        <button
                            onClick={openModalCreate}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                 className="size-4">
                                <path
                                    d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z"/>
                                <path
                                    d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"/>
                            </svg>
                            Upload Asset
                        </button>
                    )}
                </div>
                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1102px] p-4">
                                {
                                    totalPages <= 0 && (
                                        <div className="text-center text-white">No Assets Available</div>
                                    )
                                }
                                <div className="grid grid-cols-4 gap-4">
                                    {assetData.map((asset) => (
                                        <div key={asset.id}
                                             className="p-2 rounded-xl border border-gray-300 shadow-xs dark:text-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                                            <a href="#">
                                                <img
                                                    className="rounded-lg w-full h-[200px] object-contain"
                                                    src={"/media" + asset.path}
                                                    alt={asset.name}
                                                />
                                            </a>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-body truncate flex-1 mr-2">{asset.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <div className="relative group">
                                                        <a href="#"
                                                           className="inline-flex items-center text-body dark:border-white/[0.05]">
                                                            <InfoIcon/>
                                                        </a>
                                                        <div
                                                            className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-10">
                                                            <div
                                                                className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                                                Created
                                                                by: {asset.updatedBy.firstName} {asset.updatedBy.lastName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {can("asset:delete") && (
                                                        <div className="relative group">
                                                            <button
                                                                onClick={()=>openModalDelete(asset)}
                                                                title="Delete asset"
                                                                className="inline-flex items-center justify-center rounded hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                                                            >
                                                                <TrashBinIcon />
                                                            </button>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 0 && (
                                    <nav aria-label="Pagination"
                                         className="isolate inline-flex -space-x-px rounded-md mt-4">
                                        <button
                                            onClick={() => handlePageChange(displayPage - 1)}
                                            disabled={currentPage === 0}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 inset-ring inset-ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                                currentPage === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-white/5'
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
                                            pageNumber === '...' ? (
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
                                                            ? 'z-10 bg-indigo-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                                                            : 'text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5'
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
                                                currentPage === totalPages - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-white/5'
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