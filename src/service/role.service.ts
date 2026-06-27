import http from "./http";
import {Role, RoleData, RoleResponse, RoleRequest} from "@/type/Role";

export const RoleService = {
    getAll(currentPage: number, pageSize: number, name?: string): Promise<Role> {
        let url = `/admin/roles?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<RoleResponse> {
        return http.get(`/admin/roles/${id}`).then((res) => res.data);
    },

    save(data: RoleRequest): Promise<RoleResponse> {
        return http.post("/admin/roles", data).then(res => res.data);
    },

    update(id: number, data: RoleRequest): Promise<RoleResponse> {
        return http.put(`/admin/roles/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<void> {
        return http.delete(`/admin/roles/${id}`).then(res => res.data);
    },

    assignPermissions(id: number, permissionIds: number[]): Promise<RoleResponse> {
        return http.put(`/admin/roles/${id}/permissions`, permissionIds).then(res => res.data);
    }
}
