import React, {useEffect, useRef, useState} from "react";
import Button from "@/components/ui/button/Button";
import {CategoryService} from "@/service/category.service";
import {CategoryData} from "@/type/Category";
import {ActionTypes} from "@/constant/actionType";
import {DefaultModal} from "@/components/ui/modal/DefaultModal";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    action: ActionTypes;
    category?: CategoryData;
    onSuccess: (action: ActionTypes, payload: CategoryData | number) => void;
}

export default function CategoryModal({
                                          isOpen,
                                          closeModal,
                                          action,
                                          category,
                                          onSuccess,
                                      }: ModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (category) {
            setName(category.name);
            if (category.asset?.uuid) {
                setPreviewUrl(`/media/image/${category.asset.uuid}`);
            } else {
                setPreviewUrl(null);
            }
        }
    }, [category]);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setError("");
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (action !== ActionTypes.DELETE && !name.trim()) {
            setError("Category name is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            switch (action) {
                case ActionTypes.CREATE: {
                    const created = await CategoryService.save({name}, selectedFile ?? undefined);
                    onSuccess(ActionTypes.CREATE, created);
                    break;
                }

                case ActionTypes.UPDATE: {
                    if (!category) return;
                    const updated = await CategoryService.update(category.id, {name}, selectedFile ?? undefined);
                    onSuccess(ActionTypes.UPDATE, updated);
                    break;
                }

                case ActionTypes.DELETE: {
                    if (!category) return;
                    await CategoryService.delete(category.id);
                    onSuccess(ActionTypes.DELETE, category.id);
                    break;
                }
            }

            closeModal();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

    return (
        <DefaultModal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] p-6 lg:p-10 modal"
            header={
                <>
                    {action === ActionTypes.CREATE && <span>Add Category</span>}
                    {action === ActionTypes.UPDATE && <span>Update Category</span>}
                    {action === ActionTypes.DELETE && <span>Delete Category</span>}
                </>
            }
            body={
                <>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {action !== ActionTypes.DELETE && (
                        <div className="space-y-5 mt-4">
                            <div>
                                <label htmlFor="category-name"
                                       className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Category Name
                                </label>
                                <input
                                    id="category-name"
                                    type="text"
                                    placeholder="Enter category name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Category Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-full h-36 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Category preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <svg className="w-8 h-8 text-gray-400" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          strokeWidth={1.5}
                                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                <p className="mt-2 text-xs text-gray-400">No image selected</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={loading}
                                            className="hidden"
                                            id="category-image-upload"
                                        />
                                        <label
                                            htmlFor="category-image-upload"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
                                        >
                                            Choose Image
                                        </label>
                                        {previewUrl && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {action === ActionTypes.DELETE && (
                        <p className="mb-1.5 block modal-title font-medium text-gray-700 dark:text-gray-400 mt-4">
                            Are you sure you want to remove this?
                        </p>
                    )}
                </>
            }
            footer={
                <>
                    <div className="flex items-center gap-3 mt-4 modal-footer sm:justify-end">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading
                                ? action === ActionTypes.DELETE
                                    ? "Deleting..."
                                    : action === ActionTypes.UPDATE
                                        ? "Updating..."
                                        : "Saving..."
                                : action === ActionTypes.DELETE
                                    ? "Delete"
                                    : action === ActionTypes.UPDATE
                                        ? "Update"
                                        : "+ Category"}
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
                </>
            }
        />
    );
}