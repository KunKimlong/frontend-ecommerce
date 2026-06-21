import {User} from "@/type/User";

export interface Store {
    data: StoreData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface StoreData {
    id: number;
    assetId: number | null;
    logoPath: string | null;
    name: string;
    description: string;
    location: string;
    supportEmail: string;
    supportPhoneNumber: string;
    isActive: boolean;
    createdBy: User | null;
    updatedBy: User | null;
}

export interface StoreRequest {
    assetId: number;
    name: string;
    description: string;
    location: string;
    supportEmail: string;
    supportPhoneNumber: string;
    isActive: boolean;
}
