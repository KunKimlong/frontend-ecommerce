import {CategoryData} from "@/type/Category";
import {OptionValueData} from "@/type/Option";
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
    salePrice: number;
    category: CategoryData;
    variants: ProductVariantData[];
    assets: AssetData[];
}

export interface ProductVariantData {
    id: number;
    name: string;
    price: number;
    salePrice: number;
    stockQty: number;
    optionValues: OptionValueData[];
    assets: AssetData[];
}

export interface ProductRequest {
    name: string;
    description: string;
    salePrice: number;
    categoryId: number;
    variants: ProductVariantRequest[];
    assetIds?: number[];
}

export interface ProductVariantRequest {
    id?: number;
    name: string;
    price: number;
    salePrice: number;
    stockQty: number;
    optionValueIds: number[];
    assetIds: number[];
}