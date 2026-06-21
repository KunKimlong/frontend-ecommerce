import http from "./http";
import {Asset, AssetData} from "@/type/Asset";

export const AssetService = {
    getAll(currentPage:number, pageSize: number): Promise<Asset> {
        return http.get(`/asset?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    save(data: FormData, assetType?: string): Promise<AssetData> {
        if (assetType) {
            if (!data.get("assetType")) {
                data.append("assetType", assetType);
            }

            // Keep legacy field for backward compatibility with older API handlers.
            if (!data.get("type")) {
                data.append("type", assetType);
            }
        }

        const endpoint = assetType
            ? `/asset/upload?assetType=${encodeURIComponent(assetType)}&type=${encodeURIComponent(assetType)}`
            : "/asset/upload";

        return http.post(endpoint, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then(res => res.data);
    },


    delete(uuid: string): Promise<AssetData> {
        return http.delete(`/asset/${uuid}`).then(res => res.data);
    }
}
