import http from "./http";
import {User, UserData, UserRequest} from "@/type/User";

export const UserService = {
    getAll(currentPage: number, pageSize: number, name?: string, joinDate?: string): Promise<User> {
        let url = `/users?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        if (joinDate) url += `&joinDate=${joinDate}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<UserData> {
        return http.get(`/users/${id}`).then((res) => res.data);
    },

    save(data: UserRequest, file?: File): Promise<UserData> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (file) {
            formData.append("file", file);
        }
        return http.post("/users", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then(res => res.data);
    },

    update(id: number, data: Partial<UserRequest>, file?: File): Promise<UserData> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (file) {
            formData.append("file", file);
        }
        return http.put(`/users/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then(res => res.data);
    },

    delete(id: number): Promise<void> {
        return http.delete(`/users/${id}`).then(res => res.data);
    },

    getRoles(userId: number): Promise<{id: number; name: string; description: string}[]> {
        return http.get(`/admin/users/${userId}/roles`).then((res) => res.data);
    },

    assignRoles(userId: number, roleIds: number[]): Promise<{id: number; name: string; description: string}[]> {
        return http.put(`/admin/users/${userId}/roles`, roleIds).then((res) => res.data);
    }
}
