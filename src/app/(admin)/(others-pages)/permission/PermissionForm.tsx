"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {PermissionService} from "@/service/permission.service";
import {PermissionResponse, PermissionRequest} from "@/type/Permission";

interface PermissionFormProps {
    permission?: PermissionResponse;
}

export default function PermissionForm({permission}: PermissionFormProps) {
    const router = useRouter();
    const isEdit = !!permission;

    const [name, setName] = useState(permission?.name ?? "");
    const [description, setDescription] = useState(permission?.description ?? "");
    const [module, setModule] = useState(permission?.module ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Permission name is required");
            return;
        }
        if (!module.trim()) {
            setError("Module is required");
            return;
        }

        setLoading(true);
        setError("");

        const payload: PermissionRequest = {
            name: name.trim(),
            description: description.trim(),
            module: module.trim().toUpperCase(),
        };

        try {
            if (isEdit && permission) {
                await PermissionService.update(permission.id, payload);
            } else {
                await PermissionService.save(payload);
            }
            router.push("/permission");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";
    const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

    return (
        <div>
            <PageBreadcrumb pageTitle={isEdit ? "Edit Permission" : "Add Permission"}/>
            <div className="space-y-6">
                <ComponentCard>
                    <div className="p-6 lg:p-8 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className={labelClass}>Permission Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="e.g. product:create"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="module" className={labelClass}>Module</label>
                            <input
                                id="module"
                                type="text"
                                placeholder="e.g. PRODUCT"
                                value={module}
                                onChange={(e) => setModule(e.target.value)}
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className={labelClass}>Description</label>
                            <textarea
                                id="description"
                                placeholder="Description (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={3}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading
                                    ? isEdit ? "Updating..." : "Saving..."
                                    : isEdit ? "Update Permission" : "+ Add Permission"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push("/permission")}
                                disabled={loading}
                                className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
