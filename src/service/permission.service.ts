import http from "./http";
import {Permission, PermissionData, PermissionResponse, PermissionRequest} from "@/type/Permission";

export const PermissionService = {
    getAll(currentPage: number, pageSize: number): Promise<Permission> {
        return http.get(`/admin/permissions?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    getById(id: number): Promise<PermissionResponse> {
        return http.get(`/admin/permissions/${id}`).then((res) => res.data);
    },

    save(data: PermissionRequest): Promise<PermissionResponse> {
        return http.post("/admin/permissions", data).then(res => res.data);
    },

    update(id: number, data: PermissionRequest): Promise<PermissionResponse> {
        return http.put(`/admin/permissions/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<void> {
        return http.delete(`/admin/permissions/${id}`).then(res => res.data);
    }
}
