import {useEffect, useRef, useState} from "react";
import Button from "@/components/ui/button/Button";
import {ActionTypes} from "@/constant/actionType";
import {DefaultModal} from "@/components/ui/modal/DefaultModal";
import {AssetService} from "@/service/asset.service";
import {AssetData} from "@/type/Asset";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    action: ActionTypes;
    asset?: AssetData;
    onSuccess: (action: ActionTypes, payload: AssetData | number) => void;
}

export default function AssetModal({
                                       isOpen,
                                       closeModal,
                                       action,
                                       asset,
                                       onSuccess,
                                   }: ModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setPreview(null);
            setError("");
            setDragOver(false);
        }
    }, [isOpen]);

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
        if (action !== ActionTypes.DELETE && !file) {
            setError("Please select a file to upload");
            return;
        }

        setLoading(true);
        setError("");

        try {
            switch (action) {
                case ActionTypes.CREATE: {
                    const formData = new FormData();
                    formData.append("file", file!);
                    const created = await AssetService.save(formData);
                    onSuccess(ActionTypes.CREATE, created);
                    break;
                }

                case ActionTypes.DELETE: {
                    console.log(asset)
                    if (!asset) return;
                    await AssetService.delete(asset.uuid);
                    onSuccess(ActionTypes.DELETE, asset.id);
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

    return (
        <DefaultModal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] p-6 lg:p-10 modal"
            header={
                <>
                    {action === ActionTypes.CREATE && <span>Upload Asset</span>}
                    {action === ActionTypes.DELETE && <span>Delete Asset</span>}
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
                        <div className="mt-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
                                        alt="Preview"
                                        className="max-h-48 rounded-lg object-contain"
                                    />
                                ) : (
                                    <>
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-gray-400">
                                                <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Drag & drop or <span className="text-indigo-500">browse</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, SVG, WEBP up to 10MB</p>
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
                                    <div className="flex items-center gap-2 min-w-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0 text-indigo-500">
                                            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd"/>
                                        </svg>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setPreview(null); }}
                                        className="ml-2 shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {action === ActionTypes.DELETE && (
                        <p className="font-medium text-gray-700 modal-title dark:text-gray-400">
                            Are you sure you want to delete this asset?
                        </p>
                    )}
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
                        {loading
                            ? action === ActionTypes.DELETE ? "Deleting..." : "Uploading..."
                            : action === ActionTypes.DELETE ? "Delete" : "Upload"}
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
