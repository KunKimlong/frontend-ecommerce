import http from "./http";
import {Option, OptionData, OptionRequest, OptionValue, OptionValueData, OptionValueRequest} from "@/type/Option";

export const OptionService = {
    // Option endpoints
    getAll(currentPage: number, pageSize: number, name?: string): Promise<Option> {
        let url = `/option?page=${currentPage}&size=${pageSize}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        return http.get(url).then((res) => res.data);
    },

    getById(id: number): Promise<OptionData> {
        return http.get(`/option/${id}`).then((res) => res.data);
    },

    save(data: OptionRequest): Promise<OptionData> {
        return http.post("/option", data).then(res => res.data);
    },

    update(id: number, data: OptionRequest): Promise<OptionData> {
        return http.put(`/option/${id}`, data).then(res => res.data);
    },

    delete(id: number): Promise<void> {
        return http.delete(`/option/${id}`).then(res => res.data);
    },

    // Option Value endpoints
    getAllValues(currentPage: number, pageSize: number): Promise<OptionValue> {
        return http.get(`/option-value?page=${currentPage}&size=${pageSize}`).then((res) => res.data);
    },

    saveValue(data: OptionValueRequest): Promise<OptionValueData> {
        return http.post("/option-value", data).then(res => res.data);
    },

    updateValue(id: number, data: OptionValueRequest): Promise<OptionValueData> {
        return http.put(`/option-value/${id}`, data).then(res => res.data);
    },

    deleteValue(id: number): Promise<void> {
        return http.delete(`/option-value/${id}`).then(res => res.data);
    }
}
