"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "@/components/ui/modal/index";
import Button from "@/components/ui/button/Button";
import { AssetService } from "@/service/asset.service";
import { AssetData } from "@/type/Asset";

interface AssetSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: number[];
    onSelect: (selectedIds: number[]) => void;
    assets: AssetData[];
    onAssetUploaded: (newAsset: AssetData) => void;
}

export default function AssetSelectorModal({
    isOpen,
    onClose,
    selectedIds,
    onSelect,
    assets,
    onAssetUploaded,
}: AssetSelectorModalProps) {
    const [draftSelectedIds, setDraftSelectedIds] = useState<number[]>(selectedIds);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync draft state when modal opens
    useEffect(() => {
        if (isOpen) {
            setDraftSelectedIds(selectedIds);
            setSearchQuery("");
            setUploadError("");
        }
    }, [isOpen, selectedIds]);

    const filteredAssets = useMemo(() => {
        if (!searchQuery.trim()) return assets;
        const query = searchQuery.toLowerCase();
        return assets.filter((asset) => asset.name.toLowerCase().includes(query));
    }, [assets, searchQuery]);

    const toggleAsset = (id: number) => {
        setDraftSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id]
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setUploadError("");

        try {
            const newAsset = await AssetService.save(formData);
            onAssetUploaded(newAsset);
            setDraftSelectedIds((prev) => [...prev, newAsset.id]);
        } catch (err: any) {
            setUploadError(err.message || "Failed to upload image");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleApply = () => {
        onSelect(draftSelectedIds);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[850px] w-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl"
        >
            <div className="flex flex-col h-[600px] max-h-[85vh]">
                {/* Header */}
                <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Select Product Images
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Select images from the library or upload new ones to use for this product.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 py-4 items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 px-3 rounded-xl mt-3">

                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                        />
                        <svg
                            className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-4 h-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            startIcon={
                                uploading ? (
                                    <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                )
                            }
                        >
                            {uploading ? "Uploading..." : "Upload New Image"}
                        </Button>
                    </div>
                </div>

                {uploadError && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg">
                        <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto mt-4 pr-1 custom-scrollbar">
                    {filteredAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <svg
                                className="w-12 h-12 text-gray-350 dark:text-gray-650 mb-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                            </svg>
                            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                {searchQuery ? "No matching images found" : "No images in the library"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                {searchQuery
                                    ? "Try refining your search query or upload a new image above."
                                    : "Upload your first image to start building your product media gallery."}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-3 text-xs text-brand-600 hover:text-brand-700 font-semibold"
                                >
                                    Clear Search Query
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-0.5">
                            {filteredAssets.map((asset) => {
                                const selected = draftSelectedIds.includes(asset.id);
                                return (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => toggleAsset(asset.id)}
                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 text-left focus:outline-none ${
                                            selected
                                                ? "border-brand-500 ring-4 ring-brand-500/10 shadow-md"
                                                : "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-650"
                                        }`}
                                    >
                                        <img
                                            src={"/media" + asset.path}
                                            alt={asset.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {/* Selection Overlay Checkmark */}
                                        <div className="absolute top-2 right-2 z-10">
                                            <div
                                                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all shadow ${
                                                    selected
                                                        ? "bg-brand-500 border border-brand-500 scale-100"
                                                        : "bg-black/20 hover:bg-black/40 border border-white/40 scale-90"
                                                }`}
                                            >
                                                {selected ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        className="w-3.5 h-3.5 text-white"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <span className="sr-only">Unselected</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <p className="text-[10px] text-white font-medium truncate">
                                                {asset.name}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {draftSelectedIds.length === 0
                            ? "No images selected"
                            : `${draftSelectedIds.length} image${draftSelectedIds.length > 1 ? "s" : ""} selected`}
                    </span>
                    <div className="flex gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-750 dark:text-gray-350 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button size="sm" variant="primary" onClick={handleApply}>
                            Apply Selection
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
