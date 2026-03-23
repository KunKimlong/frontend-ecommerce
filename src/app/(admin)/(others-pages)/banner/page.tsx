import {Metadata} from "next";
import React from "react";
import BannerTable from "@/app/(admin)/(others-pages)/banner/BannerTable";

export const metadata: Metadata = {
    title: "Banner",
};

export default function BannerPage() {
    return <BannerTable/>;
}