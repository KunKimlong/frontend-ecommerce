"use client";
import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import {PermissionService} from "@/service/permission.service";
import {PermissionResponse} from "@/type/Permission";

export default function PermissionDetailPage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();

    const [permission, setPermission] = useState<PermissionResponse | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPermission = async () => {
            try {
                const data: PermissionResponse = await PermissionService.getById(Number(id));
                setPermission(data);
            } catch {
                setError("Failed to load permission");
            } finally {
                setLoading(false);
            }
        };
        fetchPermission();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading permission...</p>
            </div>
        );
    }

    if (error || !permission) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "Permission not found"}</p>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Permission Detail"/>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/permission")}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                             className="w-4 h-4">
                            <path fillRule="evenodd"
                                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                                  clipRule="evenodd"/>
                        </svg>
                        Back to Permissions
                    </button>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push(`/permission/${permission.id}/edit`)}
                    >
                        Edit Permission
                    </Button>
                </div>

                <ComponentCard>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Name</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{permission.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Module</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{permission.module}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Description</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{permission.description || "-"}</p>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
