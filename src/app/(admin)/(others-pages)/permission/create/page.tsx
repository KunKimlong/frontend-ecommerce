import {Metadata} from "next";
import PermissionForm from "@/app/(admin)/(others-pages)/permission/PermissionForm";

export const metadata: Metadata = {
    title: "Create Permission",
};

export default function CreatePermissionPage() {
    return <PermissionForm/>;
}
