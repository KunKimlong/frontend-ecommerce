
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

    save(data: EmployeeCreateRequest): Promise<EmployeeData> {
        return http.post("/employee", data).then(res => res.data);
    },

    update(id: number, data: Partial<EmployeeCreateRequest>): Promise<EmployeeData> {
        return http.put(`/employee/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<EmployeeData> {
        return http.delete(`/employee/${id}`).then(res => res.data);
    }
}
