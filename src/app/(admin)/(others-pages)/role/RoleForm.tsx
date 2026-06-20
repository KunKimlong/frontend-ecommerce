"use client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import MultiSelect from "@/components/form/MultiSelect";
import {RoleService} from "@/service/role.service";
import {PermissionService} from "@/service/permission.service";
import {RoleResponse, RoleRequest} from "@/type/Role";
import {PermissionData} from "@/type/Permission";

interface RoleFormProps {
    role?: RoleResponse;
}

export default function RoleForm({role}: RoleFormProps) {
    const router = useRouter();
    const isEdit = !!role;

    const [name, setName] = useState(role?.name ?? "");
    const [description, setDescription] = useState(role?.description ?? "");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        role?.permissions?.map(p => String(p.id)) ?? []
    );
    const [allPermissions, setAllPermissions] = useState<PermissionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await PermissionService.getAll(0, 100);
                setAllPermissions(res.data);
            } catch {
                setError("Failed to load permissions");
            }
        };
        fetchPermissions();
    }, []);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Role name is required");
            return;
        }

        setLoading(true);
        setError("");

        const payload: RoleRequest = {
            name: name.trim(),
            description: description.trim(),
            permissionIds: selectedPermissions.map(Number),
        };

        try {
            if (isEdit && role) {
                await RoleService.update(role.id, payload);
            } else {
                await RoleService.save(payload);
            }
            router.push("/role");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";
    const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

    const permissionOptions = allPermissions.map(p => ({
        value: String(p.id),
        text: `${p.name} (${p.module})`,
        selected: selectedPermissions.includes(String(p.id)),
    }));

    return (
        <div>
            <PageBreadcrumb pageTitle={isEdit ? "Edit Role" : "Add Role"}/>
            <div className="space-y-6">
                <ComponentCard>
                    <div className="p-6 lg:p-8 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className={labelClass}>Role Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Role Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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

                        <div>
                            <MultiSelect
                                label="Permissions"
                                options={permissionOptions}
                                defaultSelected={selectedPermissions}
                                onChange={setSelectedPermissions}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading
                                    ? isEdit ? "Updating..." : "Saving..."
                                    : isEdit ? "Update Role" : "+ Add Role"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push("/role")}
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
