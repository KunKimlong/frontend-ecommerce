import http from "./http";
import {Category, CategoryData} from "@/type/Category";

export const CategoryService = {
    getAll(currentPage:number, pageSize: number): Promise<Category> {
        return http.get(`/category?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    getById(id: number): Promise<CategoryData> {
        return http.get(`/category/${id}`).then((res) => res.data);
    },

    save(data: { name: string }): Promise<CategoryData> {
        return http.post("/category", data).then(res => res.data);
    },

    update(id: number, data: { name: string }): Promise<CategoryData> {
        return http.put(`/category/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<CategoryData> {
        return http.delete(`/category/${id}`).then(res => res.data);
    }
}