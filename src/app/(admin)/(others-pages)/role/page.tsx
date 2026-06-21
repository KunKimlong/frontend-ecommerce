import {Metadata} from "next";
import RoleTable from "@/app/(admin)/(others-pages)/role/RoleTable";

export const metadata: Metadata = {
    title: "Role",
};

export default function RolePage() {
    return <RoleTable/>;
}
