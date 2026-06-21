import {AuditableResult} from "@/type/User";

export interface Asset {
    data: AssetData[];
    total: number;
    page: number;
    pageSize: number;
}
export interface AssetData{
    id: number;
    name: string;
    uuid: string;
    path: string;
    createdBy: AuditableResult;
    updatedBy: AuditableResult;
}