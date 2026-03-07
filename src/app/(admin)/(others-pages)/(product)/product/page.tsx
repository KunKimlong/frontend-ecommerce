import {Metadata} from "next";
import React from "react";
import ProductTable from "@/app/(admin)/(others-pages)/(product)/product/ProductTable";

export const metadata: Metadata = {
    title: "Product",
};


export default function ProductPage() {
    return <ProductTable />;
}