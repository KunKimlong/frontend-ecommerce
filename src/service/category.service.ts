import http from "@/service/http";
import {Category, CategoryData} from "@/type/Category";

export const CategoryService = {
    getAll(currentPage: number, pageSize: number, name?: string): Promise<Category> {
        let url = `/category?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<CategoryData> {
        return http.get(`/category/${id}`).then((res) => res.data);
    },

    save(data: { name: string }, file?: File): Promise<CategoryData> {
        if (file) {
            const formData = new FormData();
            formData.append("data", new Blob([JSON.stringify(data)], {type: "application/json"}));
            formData.append("file", file);
            return http.post("/category", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            }).then(res => res.data);
        }
        return http.post("/category", data).then(res => res.data);
    },

    update(id: number, data: { name: string }, file?: File): Promise<CategoryData> {
        if (file) {
            const formData = new FormData();
            formData.append("data", new Blob([JSON.stringify(data)], {type: "application/json"}));
            formData.append("file", file);
            return http.put(`/category/${id}`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            }).then(res => res.data);
        }
        return http.put(`/category/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<CategoryData> {
        return http.delete(`/category/${id}`).then(res => res.data);
    }
}