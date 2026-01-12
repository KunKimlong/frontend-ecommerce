import {PencilIcon, TrashBinIcon} from "@/icons";
import React from "react";
interface ActionProps {
    id: number;
}
export default function ActionDropdown({id}: ActionProps) {

    return (
        <div className="absolute right-0 mt-2 -translate-x-1/2 rounded-lg bg-white  dark:bg-gray-900 shadow-lg z-50" >
            <button
                className="flex w-full items-center gap-2 px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                onClick={() => {
                    console.log("Edit", id);
                }}
            >
                <PencilIcon />
                Edit
            </button>
            <button
                className="flex w-full items-center gap-2 px-8 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 text-left"
                onClick={() => {
                    console.log("Delete", id);
                }}
            >
                <TrashBinIcon></TrashBinIcon>
                Delete
            </button>
        </div>
    )
}