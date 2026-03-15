import {CategoryData} from "@/type/Category";
import {ColorData} from "@/type/Color";
import {AssetData} from "@/type/Asset";

export interface Product {
    data: ProductData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ProductData {
    id: number;
    name: string;
    description: string;
    importPrice: number;
    salePrice: number;
    stockQty: number;
    category: CategoryData;
    colors: ColorData[];
    assets: AssetData[];
}

export interface ProductRequest{
    name: string;
    description: string;
    importPrice: number;
    salePrice: number;
    stockQty: number;
    categoryId: number;
    colorIds: number[];
    assets?: number[];
}