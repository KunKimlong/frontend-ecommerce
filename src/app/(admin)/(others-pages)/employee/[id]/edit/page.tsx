"use client";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import EmployeeForm from "../../EmployeeForm";
import {EmployeeService} from "@/service/employee.service";
import {EmployeeData} from "@/type/Employee";

export default function EditEmployeePage() {
    const {id} = useParams<{ id: string }>();
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

    return <EmployeeForm employee={employee}/>;
}
