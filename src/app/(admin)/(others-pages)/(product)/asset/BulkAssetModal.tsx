import {useEffect, useRef, useState} from "react";
import Button from "@/components/ui/button/Button";
import {DefaultModal} from "@/components/ui/modal/DefaultModal";
import {AssetService} from "@/service/asset.service";
import {AssetData} from "@/type/Asset";
import {ActionTypes} from "@/constant/actionType";

interface BulkAssetModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSuccess: (action: ActionTypes, payload: AssetData | number) => void;
}

interface UploadFileItem {
    id: string;
    file: File;
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    error?: string;
}

export default function BulkAssetModal({
                                           isOpen,
                                           closeModal,
                                           onSuccess,
                                       }: BulkAssetModalProps) {
    const [files, setFiles] = useState<UploadFileItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const filesRef = useRef<UploadFileItem[]>([]);

    // Keep ref in sync so asynchronous queue workers always see latest state
    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    useEffect(() => {
        if (!isOpen) {
            setFiles([]);
            setUploading(false);
            setDragOver(false);
        }
    }, [isOpen]);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newItems: UploadFileItem[] = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            // Skip if duplicate name and size already in list
            if (filesRef.current.some(f => f.file.name === file.name && f.file.size === file.size)) {
                continue;
            }
            newItems.push({
                id: `${file.name}-${file.size}-${Date.now()}-${i}`,
                file,
                progress: 0,
                status: "idle",
            });
        }

        setFiles(prev => [...prev, ...newItems]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    const removeFile = (id: string) => {
        if (uploading) return;
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const uploadSingleFile = async (item: UploadFileItem): Promise<AssetData> => {
        const formData = new FormData();
        formData.append("file", item.file);

        // Update progress callback
        const onProgress = (progressEvent: any) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setFiles(prev =>
                prev.map(f => (f.id === item.id ? { ...f, progress: percentCompleted } : f))
            );
        };

        // Set status to uploading
        setFiles(prev =>
            prev.map(f => (f.id === item.id ? { ...f, status: "uploading", progress: 0 } : f))
        );

        try {
            const created = await AssetService.save(formData, onProgress);
            setFiles(prev =>
                prev.map(f => (f.id === item.id ? { ...f, status: "success", progress: 100 } : f))
            );
            // Trigger partial success to refetch dashboard
            onSuccess(ActionTypes.CREATE, created);
            return created;
        } catch (err: any) {
            const errMsg = err.message || "Failed to upload";
            setFiles(prev =>
                prev.map(f => (f.id === item.id ? { ...f, status: "error", error: errMsg } : f))
            );
            throw err;
        }
    };

    const startUploadAll = async () => {
        if (uploading) return;
        
        // Find files that are ready to be uploaded (idle or error)
        const pendingItems = files.filter(f => f.status === "idle" || f.status === "error");
        if (pendingItems.length === 0) return;

        setUploading(true);

        const concurrencyLimit = 3;
        const queue = [...pendingItems];

        const worker = async () => {
            while (queue.length > 0) {
                const nextItem = queue.shift();
                if (!nextItem) break;
                
                try {
                    await uploadSingleFile(nextItem);
                } catch (e) {
                    // Failures are handled within uploadSingleFile (sets status to error)
                    console.error("Upload error for file " + nextItem.file.name, e);
                }
            }
        };

        // Spawn concurrent workers
        const workers = [];
        for (let i = 0; i < Math.min(concurrencyLimit, queue.length); i++) {
            workers.push(worker());
        }

        await Promise.all(workers);
        setUploading(false);
    };

    const retryFile = async (id: string) => {
        const item = files.find(f => f.id === id);
        if (!item || uploading) return;

        setUploading(true);
        try {
            await uploadSingleFile(item);
        } catch (e) {
            console.error("Retry failed for file " + item.file.name, e);
        } finally {
            // Check if any other files are still uploading
            const stillUploading = filesRef.current.some(f => f.status === "uploading");
            setUploading(stillUploading);
        }
    };

    const clearCompleted = () => {
        if (uploading) return;
        setFiles(prev => prev.filter(f => f.status !== "success"));
    };

    const completedCount = files.filter(f => f.status === "success").length;
    const totalCount = files.length;
    const isUploadFinished = totalCount > 0 && files.every(f => f.status === "success" || f.status === "error");

    return (
        <DefaultModal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[750px] p-6 lg:p-10 modal"
            header={
                <div className="flex items-center justify-between w-full pr-8">
                    <span>Bulk Upload Assets</span>
                    {totalCount > 0 && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {completedCount} of {totalCount} uploaded
                        </span>
                    )}
                </div>
            }
            body={
                <div className="space-y-4">
                    {/* Drag and Drop Zone */}
                    <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-150 flex flex-col items-center justify-center gap-3 py-8 px-4 ${
                            uploading ? "opacity-55 cursor-not-allowed border-gray-300 bg-gray-50 dark:bg-transparent" : ""
                        } ${
                            dragOver
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                : "border-gray-300 hover:border-indigo-400 dark:border-gray-700 dark:hover:border-indigo-600"
                        }`}
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-gray-400">
                                <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Drag & drop multiple files or <span className="text-indigo-500">browse</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, SVG, WEBP (Multiple selection supported)</p>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                        disabled={uploading}
                    />

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-white/[0.01]">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02]">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Queue</span>
                                {!uploading && completedCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearCompleted}
                                        className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                                    >
                                        Clear Completed
                                    </button>
                                )}
                            </div>

                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-150 dark:divide-gray-800 custom-scrollbar">
                                {files.map((item) => (
                                    <div key={item.id} className="p-3.5 flex flex-col gap-2 transition-all">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                    {item.file.type.startsWith("image/") ? (
                                                        <img
                                                            src={URL.createObjectURL(item.file)}
                                                            alt="preview"
                                                            className="w-full h-full object-cover"
                                                            onLoad={(e) => URL.revokeObjectURL((e.target as any).src)}
                                                        />
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 text-gray-400">
                                                            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate pr-2" title={item.file.name}>
                                                        {item.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {formatBytes(item.file.size)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action / Status */}
                                            <div className="shrink-0 flex items-center gap-2">
                                                {item.status === "success" && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-md">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                                        </svg>
                                                        Done
                                                    </span>
                                                )}

                                                {item.status === "error" && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2 py-1 rounded-md" title={item.error}>
                                                            Error
                                                        </span>
                                                        {!uploading && (
                                                            <button
                                                                type="button"
                                                                onClick={() => retryFile(item.id)}
                                                                className="text-xs text-indigo-500 hover:text-indigo-600 hover:underline font-semibold"
                                                            >
                                                                Retry
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {item.status === "uploading" && (
                                                    <span className="text-xs font-semibold text-indigo-500 animate-pulse">
                                                        {item.progress}%
                                                    </span>
                                                )}

                                                {item.status === "idle" && !uploading && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(item.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4.5">
                                                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {item.status === "uploading" && (
                                            <div className="w-full bg-gray-150 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1">
                                                <div
                                                    className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            }
            footer={
                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    {files.length > 0 && files.some(f => f.status === "idle" || f.status === "error") && (
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={startUploadAll}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Upload All"}
                        </Button>
                    )}

                    <button
                        onClick={closeModal}
                        type="button"
                        disabled={uploading}
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto disabled:opacity-50"
                    >
                        {isUploadFinished ? "Done" : "Close"}
                    </button>
                </div>
            }
        />
    );
}
