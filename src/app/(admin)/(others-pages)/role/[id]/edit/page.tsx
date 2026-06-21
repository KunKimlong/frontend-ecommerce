"use client";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import RoleForm from "../../RoleForm";
import {RoleService} from "@/service/role.service";
import {RoleResponse} from "@/type/Role";

export default function EditRolePage() {
    const {id} = useParams<{ id: string }>();
    const [role, setRole] = useState<RoleResponse | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const data: RoleResponse = await RoleService.getById(Number(id));
                setRole(data);
            } catch {
                setError("Failed to load role");
            } finally {
                setLoading(false);
            }
        };
        fetchRole();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading role...</p>
            </div>
        );
    }

    if (error || !role) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "Role not found"}</p>
            </div>
        );
    }

    return <RoleForm role={role}/>;
}
