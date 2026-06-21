"use client";
import Image from "next/image";
import {useUser} from "@/context/UserContext";

export default function UserMetaCard() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                    <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                        {user.imageUrl ? (
                            <Image
                                width={80}
                                height={80}
                                src={user.imageUrl}
                                alt="Profile"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 bg-gray-100 dark:bg-gray-800">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="mb-1 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                            {user.firstName} {user.lastName}
                        </h4>
                        <div className="flex flex-col items-center gap-1 xl:flex-row xl:gap-3 xl:text-left">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}