import AssetTable from "@/app/(admin)/(others-pages)/(product)/asset/AssetTable";
import {Metadata} from "next";

export const metadata: Metadata ={
    title: "Asset"
}

export default function AssetPage() {
    return <AssetTable />
}