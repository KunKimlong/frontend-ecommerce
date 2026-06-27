import http from "./http";
import {Banner, BannerData, BannerRequest, BannerType} from "@/type/Banner";

let prefix = "/admin";

export const BannerService = {
    getAll(currentPage: number, pageSize: number, label?: string): Promise<Banner> {
        let url = `${prefix}/banner?page=${currentPage}&size=${pageSize}`;
        if (label) url += `&label=${encodeURIComponent(label)}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<BannerData> {
        return http.get(`${prefix}/banner/${id}`).then((res) => res.data);
    },

    save(data: BannerRequest, file?: File): Promise<BannerData> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(data)], {type: "application/json"}));
        if (file) {
            formData.append("file", file);
        }
        return http.post(`${prefix}/banner`, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        }).then(res => res.data);
    },

    update(id: number, data: BannerRequest, file?: File): Promise<BannerData> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(data)], {type: "application/json"}));
        if (file) {
            formData.append("file", file);
        }
        return http.put(`${prefix}/banner/${id}`, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        }).then(res => res.data);
    },

    delete(id: number): Promise<BannerData> {
        return http.delete(`${prefix}/banner/${id}`).then(res => res.data);
    },

    getTypes(): Promise<BannerType[]> {
        return http.get(`/banner-type`).then(res => res.data);
    }
}
