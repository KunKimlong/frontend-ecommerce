import http from "@/service/http";
import {Product, ProductData, ProductRequest} from "@/type/Product";

export const ProductService = {
    getAll(currentPage:number, pageSize: number): Promise<Product> {
        return http.get(`/product?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    getById(id: number): Promise<ProductData> {
        return http.get(`/product/${id}`).then((res) => res.data);
    },

    save(data: ProductRequest): Promise<ProductData> {
        return http.post("/product", data).then(res => res.data);
    },

    update(id: number, data: ProductRequest): Promise<ProductData> {
        return http.put(`/product/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<ProductData> {
        return http.delete(`/product/${id}`).then(res => res.data);
    }
}