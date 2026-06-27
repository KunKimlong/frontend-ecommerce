import {AssetData} from "@/type/Asset";
import {AuditableResult} from "@/type/User";

export interface Category {
    data: CategoryData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CategoryData {
    id: number;
    name: string;
    asset?: AssetData;
    createdBy: AuditableResult;
    updatedBy: AuditableResult;
}