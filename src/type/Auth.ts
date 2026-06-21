export interface MeResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    gender: string;
    phone?: string;
    joinDate?: string;
    imageUrl?: string;
    permissions?: string[];
}