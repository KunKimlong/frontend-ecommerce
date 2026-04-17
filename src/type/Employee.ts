export interface Employee {
    employeeData: EmployeeData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface EmployeeCreatedBy {
    id: number;
    firstName: string;
    lastName: string;
}

export interface EmployeeData {
    id: number;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phone: string;
    joinDate: string;
    imageUrl?: string | null;
    createdBy?: EmployeeCreatedBy | null;
    updatedBy?: EmployeeCreatedBy | null;
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
