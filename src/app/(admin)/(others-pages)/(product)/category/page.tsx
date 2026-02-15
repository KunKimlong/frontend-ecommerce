import {Metadata} from "next";
import React from "react";
import CategoryTable from "@/app/(admin)/(others-pages)/(product)/category/CategoryTable";


export const metadata: Metadata = {
    title: "Category",
    description:
        "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};


export default function CategoryPage() {
    return <CategoryTable />;
}