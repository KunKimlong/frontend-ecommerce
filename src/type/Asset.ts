import {User} from "@/type/User";

export interface Asset {
    assetData: AssetData[];
    total: number;
    page: number;
    pageSize: number;
}
export interface AssetData{
    id: number;
    name: string;
    uuid: string;
    path: string;
    createdBy: User;
    updatedBy: User;
}