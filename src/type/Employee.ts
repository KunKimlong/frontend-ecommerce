import {AuditableResult} from "@/type/User";

export interface Employee {
    employeeData: EmployeeData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface EmployeeData {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phone: string;
    joinDate: string;
    imageUrl?: string | null;
    createdBy?: AuditableResult | null;
    updatedBy?: AuditableResult | null;
}

export interface EmployeeCreateRequest {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    password?: string;
    phone: string;
    joinDate: string;
}
