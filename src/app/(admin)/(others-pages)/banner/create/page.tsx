import {Metadata} from "next";
import React from "react";
import BannerForm from "@/app/(admin)/(others-pages)/banner/BannerForm";

export const metadata: Metadata = {
    title: "Create Banner",
};

export default function BannerCreatePage() {
    return <BannerForm/>;
}