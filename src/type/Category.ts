import {User} from "@/type/User";

export interface Category {
    categoryData: CategoryData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CategoryData {
    id: number;
    name: string;
    createdBy: User;
    updatedBy: User;
}