import http from "./http";
import {Banner, BannerData, BannerRequest} from "@/type/Banner";

let prefix = "/admin";

export const BannerService = {
    getAll(currentPage: number, pageSize: number): Promise<Banner> {
        return http.get(`${prefix}/banner?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    getById(id: number): Promise<BannerData> {
        return http.get(`${prefix}/banner/${id}`).then((res) => res.data);
    },

    save(data: BannerRequest): Promise<BannerData> {
        return http.post(`${prefix}/banner`, data).then(res => res.data);
    },

    update(id: number, data: BannerRequest): Promise<BannerData> {
        return http.put(`${prefix}/banner/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<BannerData> {
        return http.delete(`${prefix}/banner/${id}`).then(res => res.data);
    }
}
