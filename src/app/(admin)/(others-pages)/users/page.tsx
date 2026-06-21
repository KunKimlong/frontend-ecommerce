import {Metadata} from "next";
import UserTable from "@/app/(admin)/(others-pages)/users/UserTable";

export const metadata: Metadata = {
    title: "Users",
};

export default function UserPage() {
    return <UserTable/>;
}
