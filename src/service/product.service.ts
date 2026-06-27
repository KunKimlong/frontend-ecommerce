import http from "@/service/http";
import {Product, ProductData, ProductRequest} from "@/type/Product";
let prefix = "/admin";
export const ProductService = {

    getAll(currentPage:number, pageSize: number, name?: string): Promise<Product> {
        let url = `${prefix}/product?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<ProductData> {
        return http.get(`${prefix}/product/${id}`).then((res) => res.data);
    },

    save(data: ProductRequest): Promise<ProductData> {
        return http.post(`${prefix}/product`, data).then(res => res.data);
    },

    update(id: number, data: ProductRequest): Promise<ProductData> {
        return http.put(`${prefix}/product/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<ProductData> {
        return http.delete(`${prefix}/product/${id}`).then(res => res.data);
    }
}