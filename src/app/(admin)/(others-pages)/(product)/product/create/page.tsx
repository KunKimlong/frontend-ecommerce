import {Metadata} from "next";
import ProductForm from "@/app/(admin)/(others-pages)/(product)/product/ProductForm";

export const metadata: Metadata = {
    title: "Create Product",
};


export default function CreateProductPage() {
    return <ProductForm />;
}
