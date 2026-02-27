import http from "./http";
import {Asset, AssetData} from "@/type/Asset";

export const AssetService = {
    getAll(currentPage:number, pageSize: number): Promise<Asset> {
        return http.get(`/asset?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    save(data: FormData): Promise<AssetData> {
        return http.post("/asset/upload", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then(res => res.data);
    },


    delete(uuid: string): Promise<AssetData> {
        return http.delete(`/asset/${uuid}`).then(res => res.data);
    }
}