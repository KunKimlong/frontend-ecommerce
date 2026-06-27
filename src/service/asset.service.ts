import http from "./http";
import {Asset, AssetData} from "@/type/Asset";

export const AssetService = {
    getAll(currentPage:number, pageSize: number, name?: string): Promise<Asset> {
        let url = `/asset?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        return http.get(url).then((res) => res.data);
    },

    save(data: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<AssetData> {
        return http.post("/asset/upload", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        }).then(res => res.data);
    },


    delete(uuid: string): Promise<AssetData> {
        return http.delete(`/asset/${uuid}`).then(res => res.data);
    }
}