import {Metadata} from "next";
import React from "react";
import StoreForm from "@/app/(admin)/(others-pages)/(product)/store/StoreForm";

export const metadata: Metadata = {
    title: "Store",
};

export default function StorePage() {
    return <StoreForm />;
}
