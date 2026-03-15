"use client";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import ProductForm from "../../ProductForm";
import {ProductService} from "@/service/product.service";
import {ProductData} from "@/type/Product";

export default function EditProductPage() {
    const {id} = useParams<{id: string}>();
    const [product, setProduct] = useState<ProductData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data: ProductData = await ProductService.getById(Number(id));
                setProduct(data);
            } catch (err) {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading product...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "Product not found"}</p>
            </div>
        );
    }

    return <ProductForm product={product} />;
}