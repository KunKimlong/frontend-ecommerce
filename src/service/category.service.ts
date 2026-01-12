import http from "./http";
import {Category} from "@/type/Category";

export const CategoryService = {
    getAll(): Promise<Category[]> {
        return http.get("/category").then((res) => res.data);
    },

    getById(id: number): Promise<Category> {
        return http.get(`/category/${id}`).then((res) => res.data);
    },

    save(data: { name: string }): Promise<Category> {
        return http.post("/category", data).then(res => res.data);
    },

    update(id: number, data: { name: string }): Promise<Category> {
        return http.put(`/category/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<void> {
        return http.delete(`/category/${id}`).then(res => res.data);
    }
}