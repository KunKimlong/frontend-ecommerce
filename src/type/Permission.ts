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