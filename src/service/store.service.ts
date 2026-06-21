import http from "./http";
import {Store, StoreData, StoreRequest} from "@/type/Store";

interface GetAllOptions {
    sortBy?: string;
    ascending?: boolean;
}

export const StoreService = {
    getAll(currentPage: number, pageSize: number, options: GetAllOptions = {}): Promise<Store> {
        const {sortBy = "id", ascending = false} = options;
        return http
            .get(
                `/admin/store?page=${currentPage}&size=${pageSize}&sortBy=${encodeURIComponent(sortBy)}&ascending=${ascending}`
            )
            .then((res) => res.data);
    },

    update(id: number, data: StoreRequest, file?: File): Promise<StoreData> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(data)], {type: "application/json"}));
        if (file) {
            formData.append("file", file);
        }
        return http.put(`/admin/store/${id}`, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        }).then((res) => res.data);
    },

};
