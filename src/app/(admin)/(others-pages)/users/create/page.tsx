import {Metadata} from "next";
import UserForm from "@/app/(admin)/(others-pages)/users/UserForm";

export const metadata: Metadata = {
    title: "Create User",
};

export default function CreateUserPage() {
    return <UserForm/>;
}
