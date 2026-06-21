import {Metadata} from "next";
import OptionTable from "@/app/(admin)/(others-pages)/(product)/option/OptionTable";

export const metadata: Metadata = {
    title: "Options & Variants",
};

export default function OptionPage() {
    return <OptionTable />;
}
