import {PencilIcon, TrashBinIcon} from "@/icons";
import React from "react";
import {Category} from "@/type/Category";

interface ActionProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export default function ActionDropdown({category, onEdit, onDelete}: ActionProps) {

    return (
        <div className="absolute right-0 mt-2 -translate-x-1/2 rounded-lg bg-white  dark:bg-gray-900 shadow-lg z-50">
            <button
                className="flex w-full items-center gap-2 px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                onClick={() => onEdit(category)}
            >
                <PencilIcon/>
                Edit
            </button>
            <button
                className="flex w-full items-center gap-2 px-8 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 text-left"
                onClick={() => onDelete(category)}
            >
                <TrashBinIcon></TrashBinIcon>
                Delete
            </button>
        </div>
    )
}