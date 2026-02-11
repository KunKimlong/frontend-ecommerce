import {User} from "@/type/User";

export interface Category {
    id: number;
    name: string;
    createdBy: User;
    updatedBy: User;
}