export interface Employee {
    employeeData: EmployeeData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface EmployeeAsset {
    id: number;
    name: string;
    path: string;
    uuid: string;
    type: string;
    size: number;
}

export interface EmployeeData {
    id: number;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phone: string;
    joinDate: string;
    asset?: EmployeeAsset | null;
}

export interface EmployeeCreateRequest {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    password: string;
    phone: string;
    joinDate: string;
}
