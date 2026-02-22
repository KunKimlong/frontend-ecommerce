import {Metadata} from "next";
import React from "react";
import CategoryTable from "@/app/(admin)/(others-pages)/(product)/category/CategoryTable";
import ColorTable from "@/app/(admin)/(others-pages)/(product)/color/ColorTable";


export const metadata: Metadata = {
    title: "Color",
};


export default function CategoryPage() {
    return <ColorTable />;
}