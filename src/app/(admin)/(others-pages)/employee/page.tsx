import {Metadata} from "next";
import React from "react";
import EmployeeTable from "@/app/(admin)/(others-pages)/employee/EmployeeTable";


export const metadata: Metadata = {
    title: "Employee",
    description:
        "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};


export default function EmployeePage() {
    return <EmployeeTable />;
}