"use client";
import {useUser} from "@/context/UserContext";

export default function UserInfoCard() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    const fields = [
        { label: "First Name", value: user.firstName },
        { label: "Last Name", value: user.lastName },
        { label: "Email", value: user.email },
        { label: "Phone", value: user.phone || "-" },
        { label: "Gender", value: user.gender === "MALE" ? "Male" : user.gender === "FEMALE" ? "Female" : user.gender || "-" },
        { label: "Join Date", value: user.joinDate || "-" },
        { label: "Role", value: user.role },
    ];

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                {fields.map((field) => (
                    <div key={field.label}>
                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                            {field.label}
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {field.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}