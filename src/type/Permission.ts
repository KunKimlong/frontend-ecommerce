export interface Permission {
    data: PermissionData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PermissionData {
    id: number;
    name: string;
    description: string;
    module: string;
}

export interface PermissionResponse {
    id: number;
    name: string;
    description: string;
    module: string;
    createdBy: any;
    updatedBy: any;
}

export interface PermissionRequest {
    name: string;
    description: string;
    module: string;
}
