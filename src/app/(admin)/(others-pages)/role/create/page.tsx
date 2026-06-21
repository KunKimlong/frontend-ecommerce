import {Metadata} from "next";
import RoleForm from "@/app/(admin)/(others-pages)/role/RoleForm";

export const metadata: Metadata = {
    title: "Create Role",
};

export default function CreateRolePage() {
    return <RoleForm/>;
}
