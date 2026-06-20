"use client";
import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import {UserService} from "@/service/user.service";
import {UserData} from "@/type/User";

export default function UserDetailPage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();

    const [user, setUser] = useState<UserData | undefined>(undefined);
    const [roles, setRoles] = useState<{id: number; name: string; description: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data: UserData = await UserService.getById(Number(id));
                setUser(data);
                const userRoles = await UserService.getRoles(Number(id));
                setRoles(userRoles);
            } catch {
                setError("Failed to load user");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading user...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "User not found"}</p>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="User Detail"/>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/users")}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                             className="w-4 h-4">
                            <path fillRule="evenodd"
                                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                                  clipRule="evenodd"/>
                        </svg>
                        Back to Users
                    </button>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push(`/users/${user.id}/edit`)}
                    >
                        Edit User
                    </Button>
                </div>

                <ComponentCard>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                {user.imageUrl ? (
                                    <Image
                                        src={`/media${user.imageUrl.replace(/^\/api\/asset/, '')}`}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div
                                        className="h-full w-full flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300">
                                        {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "N/A"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{user.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Gender</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{user.gender}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Join Date</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{user.joinDate}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Roles</p>
                            <div className="flex flex-wrap gap-2">
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <span key={role.id}
                                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                            {role.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No roles assigned</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Legacy Role</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {user.role}
                            </span>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700"/>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {user.createdBy && (
                                <div>
                                    <p className="uppercase tracking-wider mb-0.5">Created By</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {user.createdBy.firstName} {user.createdBy.lastName}
                                    </p>
                                </div>
                            )}
                            {user.updatedBy && (
                                <div>
                                    <p className="uppercase tracking-wider mb-0.5">Updated By</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {user.updatedBy.firstName} {user.updatedBy.lastName}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
