"use client";

import React, {useEffect, useRef, useState} from "react";
import Button from "@/components/ui/button/Button";
import {DefaultModal} from "@/components/ui/modal/DefaultModal";
import {StoreData, StoreRequest} from "@/type/Store";
import {StoreService} from "@/service/store.service";
import {STORE_LOGO_REFRESH_EVENT} from "@/hooks/useStoreLogo";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    store?: StoreData;
    onSuccess: (payload: StoreData) => void;
}

const toMediaLogoUrl = (logoPath?: string | null) => {
    if (!logoPath) return null;
    return `/media${logoPath.replace(/^\/api\/asset/, "")}`;
};

export default function StoreModal({
                                       isOpen,
                                       closeModal,
                                       store,
                                       onSuccess,
                                   }: ModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [supportEmail, setSupportEmail] = useState("");
    const [supportPhoneNumber, setSupportPhoneNumber] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [assetId, setAssetId] = useState<number | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setDescription("");
            setLocation("");
            setSupportEmail("");
            setSupportPhoneNumber("");
            setIsActive(true);
            setAssetId(null);
            setFile(null);
            setPreview(null);
            setDragOver(false);
            setError("");
            return;
        }

        if (store) {
            setName(store.name ?? "");
            setDescription(store.description ?? "");
            setLocation(store.location ?? "");
            setSupportEmail(store.supportEmail ?? "");
            setSupportPhoneNumber(store.supportPhoneNumber ?? "");
            setIsActive(store.isActive);
            setAssetId(store.assetId ?? null);
            setPreview(toMediaLogoUrl(store.logoPath));
        }
    }, [isOpen, store]);

    const handleFileChange = (selected: File | null) => {
        if (!selected) return;
        setFile(selected);
        setError("");
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selected);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileChange(dropped);
    };

    const handleSubmit = async () => {
        if (!store) {
            setError("Store not found");
            return;
        }

        if (!name.trim()) {
            setError("Store name is required");
            return;
        }
        if (!description.trim()) {
            setError("Store description is required");
            return;
        }
        if (!location.trim()) {
            setError("Store location is required");
            return;
        }
        if (!supportEmail.trim()) {
            setError("Support email is required");
            return;
        }
        if (!supportPhoneNumber.trim()) {
            setError("Support phone number is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const nextAssetId = assetId ?? 0;

            if (!nextAssetId && !file) {
                setError("Store logo is required");
                return;
            }

            const payload: StoreRequest = {
                assetId: nextAssetId,
                name: name.trim(),
                description: description.trim(),
                location: location.trim(),
                supportEmail: supportEmail.trim(),
                supportPhoneNumber: supportPhoneNumber.trim(),
                isActive,
            };

            const updated = await StoreService.update(store.id, payload, file ?? undefined);
            onSuccess(updated);
            // Trigger global event to refresh store logo in header
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event(STORE_LOGO_REFRESH_EVENT));
            }

            closeModal();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultModal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[760px] p-6 lg:p-10 modal"
            header={
                <>
                    <span>Update Store</span>
                </>
            }
            body={
                <>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="mt-4 space-y-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className={`cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-150 flex flex-col items-center justify-center gap-3 py-10 px-4 ${
                                dragOver
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                    : "border-gray-300 hover:border-indigo-400 dark:border-gray-700 dark:hover:border-indigo-600"
                            }`}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Store logo preview"
                                    className="max-h-48 rounded-lg object-contain"
                                />
                            ) : (
                                <>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Drag & drop store logo or <span className="text-indigo-500">browse</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, GIF, SVG, WEBP up to 10MB
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        />

                        {file && (
                            <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                    {file.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        setPreview(toMediaLogoUrl(store?.logoPath));
                                    }}
                                    className="ml-2 shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="store-name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                >
                                    Store Name
                                </label>
                                <input
                                    id="store-name"
                                    type="text"
                                    placeholder="Enter store name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="store-location"
                                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                >
                                    Location
                                </label>
                                <input
                                    id="store-location"
                                    type="text"
                                    placeholder="Enter location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    disabled={loading}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="store-description"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                            >
                                Description
                            </label>
                            <textarea
                                id="store-description"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={3}
                                className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="store-support-email"
                                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                >
                                    Support Email
                                </label>
                                <input
                                    id="store-support-email"
                                    type="email"
                                    placeholder="Enter support email"
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    disabled={loading}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="store-support-phone"
                                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                >
                                    Support Phone Number
                                </label>
                                <input
                                    id="store-support-phone"
                                    type="text"
                                    placeholder="Enter support phone number"
                                    value={supportPhoneNumber}
                                    onChange={(e) => setSupportPhoneNumber(e.target.value)}
                                    disabled={loading}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                disabled={loading}
                            />
                            Active
                        </label>
                    </div>
                </>
            }
            footer={
                <div className="flex items-center gap-3 mt-4 modal-footer sm:justify-end">
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update"}
                    </Button>

                    <button
                        onClick={closeModal}
                        type="button"
                        disabled={loading}
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto disabled:opacity-50"
                    >
                        Close
                    </button>
                </div>
            }
        />
    );
}

