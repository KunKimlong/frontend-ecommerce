import http from "./http";
import {Permission, PermissionData} from "@/type/Permission";

export const PermissionService = {
    getAll(currentPage: number, pageSize: number, name?: string): Promise<Permission> {
        let url = `/admin/permissions?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<PermissionData> {
        return http.get(`/admin/permissions/${id}`).then((res) => res.data);
    }
}