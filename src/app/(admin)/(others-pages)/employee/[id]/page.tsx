"use client";
import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import {EmployeeService} from "@/service/employee.service";
import {EmployeeData} from "@/type/Employee";

export default function EmployeeDetailPage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();

    const [employee, setEmployee] = useState<EmployeeData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const data: EmployeeData = await EmployeeService.getById(Number(id));
                setEmployee(data);
            } catch {
            setError("Failed to load employee");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading employee...</p>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "Employee not found"}</p>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Employee Detail"/>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/employee")}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                             className="w-4 h-4">
                            <path fillRule="evenodd"
                                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                                  clipRule="evenodd"/>
                        </svg>
                        Back to Employees
                    </button>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push(`/employee/${employee.id}/edit`)}
                    >
                        Edit Employee
                    </Button>
                </div>

                <ComponentCard>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                {employee.imageUrl ? (
                                    <Image
                                        src={`/media${employee.imageUrl.replace(/^\/api\/asset/, '')}`}
                                        alt={`${employee.firstName} ${employee.lastName}`}
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div
                                        className="h-full w-full flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300">
                                        {`${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase() || "N/A"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{employee.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Gender</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{employee.gender}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Join Date</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{employee.joinDate}</p>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
