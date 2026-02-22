import http from "./http";
import {Color, ColorData, ColorRequest} from "@/type/Color";

export const ColorService = {
    getAll(currentPage:number, pageSize: number): Promise<Color> {
        return http.get(`/color?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    getById(id: number): Promise<ColorData> {
        return http.get(`/color/${id}`).then((res) => res.data);
    },

    save(data: ColorRequest): Promise<ColorData> {
        return http.post("/color", data).then(res => res.data);
    },

    update(id: number, data: ColorRequest): Promise<ColorData> {
        return http.put(`/color/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<ColorData> {
        return http.delete(`/color/${id}`).then(res => res.data);
    }
}