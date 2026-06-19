import {Metadata} from "next";
import EmployeeForm from "@/app/(admin)/(others-pages)/employee/EmployeeForm";

export const metadata: Metadata = {
    title: "Create Employee",
};

export default function CreateEmployeePage() {
    return <EmployeeForm/>;
}
