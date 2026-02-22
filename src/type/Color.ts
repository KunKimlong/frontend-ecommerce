import {User} from "@/type/User";

export interface Color {
    colorData: ColorData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ColorData {
    id: number;
    name: string;
    code: string;
    createdBy: User;
    updatedBy: User;
}

export interface ColorRequest {
    name: string;
    code: string;
}