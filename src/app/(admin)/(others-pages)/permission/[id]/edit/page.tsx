"use client";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import PermissionForm from "../../PermissionForm";
import {PermissionService} from "@/service/permission.service";
import {PermissionResponse} from "@/type/Permission";

export default function EditPermissionPage() {
    const {id} = useParams<{ id: string }>();
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

    return <PermissionForm permission={permission}/>;
}
