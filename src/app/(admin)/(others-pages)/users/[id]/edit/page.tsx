"use client";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import UserForm from "../../UserForm";
import {UserService} from "@/service/user.service";
import {UserData} from "@/type/User";

export default function EditUserPage() {
    const {id} = useParams<{ id: string }>();
    const [user, setUser] = useState<UserData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data: UserData = await UserService.getById(Number(id));
                setUser(data);
            } catch {
                setError("Failed to load user");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading user...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "User not found"}</p>
            </div>
        );
    }

    return <UserForm user={user}/>;
}
