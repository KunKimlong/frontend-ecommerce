export interface User {
    data: UserData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface AuditableResult {
    id: number;
    firstName: string;
    lastName: string;
}

export interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phone: string;
    joinDate: string;
    imageUrl?: string | null;
    role: string;
    createdBy?: AuditableResult | null;
    updatedBy?: AuditableResult | null;
}

export interface UserRequest {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    password?: string;
    phone: string;
    joinDate: string;
    roleIds?: number[];
}
