import {AuditableResult} from "@/type/User";

export interface Role {
    data: RoleResponse[];
    total: number;
    page: number;
    pageSize: number;
}

export interface RoleData {
    id: number;
    name: string;
    description: string;
}

export interface RoleResponse {
    id: number;
    name: string;
    description: string;
    permissions: PermissionItem[];
    createdBy: AuditableResult;
    updatedBy: AuditableResult;
}

export interface PermissionItem {
    id: number;
    name: string;
    description: string;
    module: string;
}

export interface RoleRequest {
    name: string;
    description: string;
    permissionIds: number[];
}
