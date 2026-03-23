import {User} from "@/type/User";
import {AssetData} from "@/type/Asset";
import {ProductData} from "@/type/Product";

export interface Banner {
    data: BannerData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface BannerData {
    id: number;
    label: string;
    headerLabel: string;
    type: string;
    description: string;
    buttonName: string;
    product: ProductData;
    assetId: number;
    asset?: AssetData;
    startAt: string;
    endAt: string;
    createdBy: User;
    updatedBy: User;
}

export interface BannerRequest {
    label: string;
    headerLabel: string;
    type: string;
    description: string;
    buttonName: string;
    productId: number | null;
    assetId: number | null;
    startAt: string;
    endAt: string;
}
