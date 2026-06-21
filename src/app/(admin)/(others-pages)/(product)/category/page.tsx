import {Metadata} from "next";
import CategoryTable from "@/app/(admin)/(others-pages)/(product)/category/CategoryTable";


export const metadata: Metadata = {
    title: "Category",
};


export default function CategoryPage() {
    return <CategoryTable />;
}
