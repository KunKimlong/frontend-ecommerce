import http from "@/service/http";
import {ProductVariantData} from "@/type/Product";

export interface VariantUpdateRequest {
    name: string;
    price: number;
    salePrice: number;
    stockQty: number;
    optionValueIds: number[];
    assetIds: number[];
}

export const VariantService = {
    getById(variantId: number): Promise<ProductVariantData> {
        return http.get(`/admin/product-variant/${variantId}`).then((res) => res.data);
    },

    update(variantId: number, data: VariantUpdateRequest): Promise<ProductVariantData> {
        return http.put(`/admin/product-variant/${variantId}`, data).then((res) => res.data);
    },
};
