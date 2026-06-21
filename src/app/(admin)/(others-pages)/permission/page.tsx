import {Metadata} from "next";
import PermissionTable from "@/app/(admin)/(others-pages)/permission/PermissionTable";

export const metadata: Metadata = {
    title: "Permission",
};

export default function PermissionPage() {
    return <PermissionTable/>;
}
