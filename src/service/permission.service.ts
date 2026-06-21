import http from "./http";
import {Permission, PermissionData} from "@/type/Permission";

export const PermissionService = {
    getAll(currentPage: number, pageSize: number): Promise<Permission> {
        return http.get(`/admin/permissions?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    getById(id: number): Promise<PermissionData> {
        return http.get(`/admin/permissions/${id}`).then((res) => res.data);
    }
}