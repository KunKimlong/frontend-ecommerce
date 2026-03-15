import http from "./http";
import { Employee, EmployeeCreateRequest, EmployeeData } from "@/type/Employee";

export const EmployeeService = {
    getAll(currentPage: number, pageSize: number, name?: string, joinDate?: string): Promise<Employee> {
        let url = `/employee?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        if (joinDate) url += `&joinDate=${joinDate}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<EmployeeData> {
        return http.get(`/employee/${id}`).then((res) => res.data);
    },

    save(data: EmployeeCreateRequest, file?: File): Promise<EmployeeData> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (file) {
            formData.append("file", file);
        }
        return http.post("/employee", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then(res => res.data);
    },

    update(id: number, data: Partial<EmployeeCreateRequest>, file?: File): Promise<EmployeeData> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (file) {
            formData.append("file", file);
        }
        return http.put(`/employee/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then(res => res.data);
    },

    delete(id: number): Promise<EmployeeData> {
        return http.delete(`/employee/${id}`).then(res => res.data);
    }
}
